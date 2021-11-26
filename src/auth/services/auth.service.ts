import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { sign } from 'jsonwebtoken';
import { UserNotFoundException } from '../../shared/exceptions/user-not-found.exception';
import { EmailService } from '../../shared/services/email.service';

import authConfig from '../auth-config.development';
import type { UserSignupDto } from '../dto';
import type { ConfirmEmailDto } from '../dto/confirmEmail.dto';
import type { ForgotPasswordDto } from '../dto/forgotPassword.dto';
import type { ResendConfirmEmailDto } from '../dto/resendConfirmEmail.dto';
import type { ResetPasswordDto } from '../dto/resetPassword.dto';
import type { VerificationTokenPayloadDto } from '../dto/verificationTokenPayload.dto';
import type { User } from '../models';
import { UserService } from './user.service';

export enum Provider {
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  GOOGLE = 'google',
  LINKEDIN = 'linkedin',
  MICROSOFT = 'microsoft',
  TWITTER = 'twitter',
  WINDOWS_LIVE = 'windowslive',
}

@Injectable()
export class AuthService {
  private readonly JWT_SECRET_KEY = authConfig.jwtSecretKey;

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private emailService: EmailService
  ) {}

  async validateOAuthLogin(
    userProfile: any,
    provider: Provider,
  ): Promise<{ jwt: string; user: User }> {
    try {
      // find user in MongoDB and if not found then create it in the DB
      let existingUser = await this.userService.findOne({
        [provider]: userProfile.userId,
      });

      if (!existingUser) {
        existingUser = await this.userService.create({
          ...userProfile,
          provider,
          providers: [{ providerId: userProfile.userId, name: provider }],
        });
      }

      const { userId, email, displayName, picture, providers, roles } =
        existingUser;
      const signingPayload = {
        userId,
        email,
        displayName,
        picture,
        providers,
        roles,
      };
      const jwt: string = sign(signingPayload, this.JWT_SECRET_KEY, {
        expiresIn: 3600,
      });

      return { jwt, user: existingUser };
    } catch (error) {
      throw new InternalServerErrorException(
        'validateOAuthLogin',
        error.message,
      );
    }
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userService.findOne({ email });

    if (user && (await this.userService.validateHash(pass, user.password))) {
      return user;
    }

    return null;
  }

  async login(user: User): Promise<{ token: string }> {
    const { email, displayName, userId, roles } = user;

    if (user.isEmailConfirmed === undefined || !user.isEmailConfirmed) {
      throw new BadRequestException('Email not confirmed yet');
    }

    return {
      token: this.jwtService.sign({ email, displayName, userId, roles }),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<boolean> {
    const { email } = forgotPasswordDto;

    const user = await this.userService.findOne(email);

    if (!user) {
      return true;
    }

    const token = this.randomString(20);
    await this.userService.saveResetToken(
      user,
      token,
      new Date(Date.now() + 3_600_000),
    );
    await this.emailService.sendForgotPasswordEmail(email.toString(), token);

    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    const { email, phone } = resetPasswordDto;
    const filter = {
      resetPasswordExpires: { $gte: new Date() },
    } as any;

    if (email) {
      filter.email = email;
    } else if (phone) {
      filter.phone = phone;
    } else {
      throw new HttpException('Not provide email neither phone', 401);
    }

    const user = await this.userService.findOne(filter);

    if (!user) {
      throw new HttpException(
        'Password reset token is invalid or has expired',
        401,
      );
    }

    await this.userService.saveNewPassword(user, resetPasswordDto);

    return true;
  }

  async signup(signupUser: UserSignupDto): Promise<{ token: string }> {
    const createdUser = await this.userService.create(signupUser);
    const { email, displayName, userId, roles } = createdUser;

    const verifyEmailToken = this.randomString(20);
    const payload: VerificationTokenPayloadDto = { email, verifyEmailToken };
    const token = this.jwtService.sign(payload);

    await this.userService.saveVerifyToken(
      createdUser,
      verifyEmailToken,
      new Date(Date.now() + 3_600_000), // 1 hour
    );

    this.emailService.sendVerificationLinkEmail(email.toString(), token);

    return {
      token: this.jwtService.sign({ email, displayName, userId, roles }),
    };
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto): Promise<boolean> {
    const { email, verifyEmailToken } = await this.decodeConfirmationToken(
      confirmEmailDto.token,
    );

    const user = await this.userService.findOne({
      email,
      verifyEmailExpires: { $gte: new Date() },
    });

    if (!user) {
      throw new HttpException(
        'Verify email token is invalid or has expired',
        401,
      );
    }

    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    await this.userService.markEmailAsConfirmed(user, verifyEmailToken);

    return true;
  }

  async resendConfirmEmail(
    resendConfirmEmailDto: ResendConfirmEmailDto,
  ): Promise<boolean> {
    const user = await this.userService.findOne({
      email: resendConfirmEmailDto.email,
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    const verifyEmailToken = this.randomString(20);
    const payload: VerificationTokenPayloadDto = {
      email: user.email,
      verifyEmailToken,
    };
    const token = this.jwtService.sign(payload);

    await this.userService.saveVerifyToken(
      user,
      verifyEmailToken,
      new Date(Date.now() + 3_600_000), // 1 hour
    );

    await this.emailService.sendVerificationLinkEmail(
      user.email.toString(),
      token,
    );

    return true;
  }

  async usernameAvailable(user: Partial<User>): Promise<boolean> {
    if (!user || !user.email) {
      return false;
    }

    const userFound = await this.userService.findOne({ email: user.email });

    return !userFound;
  }

  private randomString(size: number): string {
    if (size === 0) {
      throw new Error('Zero-length randomString is useless.');
    }

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
      'abcdefghijklmnopqrstuvwxyz' +
      '0123456789';
    let objectId = '';
    const bytes = crypto.randomBytes(size);

    for (let i = 0; i < bytes.length; ++i) {
      objectId += chars[bytes.readUInt8(i) % chars.length];
    }

    return objectId;
  }

  private randomNumber(size: number): string {
    if (size === 0) {
      throw new Error('Zero-length randomNumber is useless.');
    }

    const chars = '0123456789';
    let objectId = '';
    const bytes = crypto.randomBytes(size);

    for (let i = 0; i < bytes.length; ++i) {
      objectId += chars[bytes.readUInt8(i) % chars.length];
    }

    return objectId;
  }

  async decodeConfirmationToken(
    token: string,
  ): Promise<VerificationTokenPayloadDto> {
    try {
      const payload = this.jwtService.verify(token);

      if (typeof payload === 'object' && 'email' in payload) {
        return payload;
      }

      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }

      throw new BadRequestException('Bad confirmation token', error);
    }
  }
}
