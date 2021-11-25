import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  
  @IsEmail()
  @ApiProperty({ example: 'someone@yopmail.com', description: 'User\'s Email', type: () => 'string' })
  readonly email: { type: string, lowercase: true };

  @IsString()
  @MinLength(5)
  @ApiProperty({ description: 'User\'s Password (only applies when using username/password)', type: () => 'string' })
  readonly password: string;

  @IsString()
  @ApiProperty({ description: 'Reset password token', type: () => 'string' })
  readonly resetPasswordToken: string;
}
