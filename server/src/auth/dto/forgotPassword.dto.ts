import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @IsEmail()
  @ApiProperty({ example: 'someone@yopmail.com', description: 'User\'s Email', type: () => 'string' })
  readonly email: { type: string, lowercase: true };
}
