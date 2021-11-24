import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { sign } from 'jsonwebtoken';
import * as crypto from 'crypto';

import authConfig from '../auth-config.development';
import { UserService } from './user.service';
import { User } from '../models';
import { UserSignupDto } from '../dto';
import e = require('express');
import { ForgotPasswordDto } from '../dto/forgotPassword.dto';
import { EmailService } from 'src/shared/services/email.service';
import { ApiConfigService } from 'src/shared/services/api-config.service';
import { ResetPasswordDto } from '../dto/resetPassword.dto';

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
    private emailService: EmailService,
    private configService: ApiConfigService,
  ) { }

  async validateOAuthLogin(userProfile: any, provider: Provider): Promise<{ jwt: string; user: User }> {
    try {
      // find user in MongoDB and if not found then create it in the DB
      let existingUser = await this.userService.findOne({ [provider]: userProfile.userId });
      if (!existingUser) {
        existingUser = await this.userService.create({ ...userProfile, provider, providers: [{ providerId: userProfile.userId, name: provider }] });
      }

      const { userId, email, displayName, picture, providers, roles } = existingUser;
      const signingPayload = { userId, email, displayName, picture, providers, roles };
      const jwt: string = sign(signingPayload, this.JWT_SECRET_KEY, { expiresIn: 3600 });
      return { jwt, user: existingUser };
    } catch (err) {
      throw new InternalServerErrorException('validateOAuthLogin', err.message);
    }
  }

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userService.findOne({ email });
    if (user && (await this.userService.validateHash(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<{ token: string }> {
    const { email, displayName, userId, roles } = user;
    return { token: this.jwtService.sign({ email, displayName, userId, roles }) };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<boolean> {
    const { email } = forgotPasswordDto;
    const user = await this.userService.findOne({ email });
    if (!user) {
      return true;
    }
    const token = this.generateRandomToken();
    await this.userService.saveResetToken(
      user,
      token,
      new Date(Date.now() + 3_600_000),
    );

    this.emailService.sendForgotPasswordEmail(email.toString(), token);
    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    const { email } = resetPasswordDto;
    const user = await this.userService.findOne({
      email,
      resetPasswordExpires: { $gte: new Date() } ,
    });
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
    const { email, displayName, userId } = createdUser;
    return { token: this.jwtService.sign({ email, displayName, userId }) };
  }

  async usernameAvailable(user: Partial<User>): Promise<boolean> {
    if (!user || !user.email) {
      return false;
    }
    const userFound = await this.userService.findOne({ email: user.email });
    return !userFound;
  }

  private generateRandomToken(): string {
    return crypto.randomBytes(20).toString('hex');
  }
}
