import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { decode } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { User } from '../models/user.interface';
import { UserSignupDto } from '../dto/userSignup.dto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';
import { UserDto } from '../dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
  ) { }

  async create(newUser: User | UserSignupDto): Promise<User> {
    const objectId = Types.ObjectId();
    const roles = ['USER'];
    const userCount = await this.count();
    if (userCount === 0) {
      roles.push('ADMIN'); // the very first user will automatically get the ADMIN role
    }
    const userId = (newUser as User)?.userId || objectId.toString(); // copy over the same _id when userId isn't provided (by local signup users)
    const createdUser = new this.userModel({ ...newUser, roles, _id: objectId, userId });
    return await createdUser.save();
  }

  async count(): Promise<number> {
    return await this.userModel.countDocuments().exec();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel?.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Could not find user.');
    }
    return user;
  }

  async findOne(userProperty): Promise<User> {
    return this.userModel.findOne(userProperty).exec();
  }

  async link(userId: string, token: string, providerName: string) {
    let result;
    const decodedToken = decode(token) as User;
    const user = await this.userModel.findOne({ userId });
    console.log('link user2', (user && decodedToken && providerName), user)
    if (user && decodedToken && providerName) {
      user[providerName] = decodedToken[userId];
      user.providers.push({ providerId: decodedToken.userId, name: providerName });
      result = await user.save();
    }
    return result;
  }

  async unlink(userId: string, providerName: string) {
    console.log('unlink userId', userId)
    const result = await this.userModel.findOneAndUpdate({ userId }, { $unset: { [providerName]: true }, $pull: { 'providers': { name: providerName } } }, { new: true });
    return result;
  }

  // async updateMe(updatedUser: User) {
  //   const user = await this.findOne({ userId: updatedUser.userId });
  //   user.displayName = updatedUser.displayName;
  //   user.email = updatedUser.email;
  // }

  saveResetToken(
    user: User,
    token: string,
    resetPasswordExpires: Date,
  ): Promise<User> {
    user.resetPasswordToken = token;
    user.resetPasswordExpires = resetPasswordExpires; // 1 hour

    return user.save();
  }


  async saveNewPassword(
    user: User,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<User> {
    const isTokenValid = await this.validateHash(
      resetPasswordDto.resetPasswordToken,
      user.resetPasswordToken,
    );

    if (!isTokenValid) {
      throw new HttpException(
        'Password reset token is invalid or has expired',
        401,
      );
    }

    user.password = resetPasswordDto.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    return user.save();
  }

  saveVerifyToken(
    user: User,
    token: string,
    verifyEmailExpires: Date,
  ): Promise<User> {
    user.verifyEmailToken = token;
    user.verifyEmailExpires = verifyEmailExpires;

    return user.save();
  }

  async validateHash(plainPassword: string, hashedPassword: string): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      return Promise.resolve(false);
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async markEmailAsConfirmed(user: User, verifyEmailToken: string) {
    const isTokenValid = await this.validateHash(
      verifyEmailToken,
      user.verifyEmailToken,
    );

    if (!isTokenValid) {
      throw new HttpException(
        'Verify email token is invalid or has expired',
        401,
      );
    }
    user.isEmailConfirmed = true;
    user.verifyEmailExpires = null;
    user.verifyEmailToken = null;

    return user.save();
  }
}
