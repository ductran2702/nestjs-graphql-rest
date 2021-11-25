import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @ApiPropertyOptional({
    example: 'golfai@yopmail.com',
    description: "User's Email",
    type: () => 'string',
  })
  readonly email: { type: string; lowercase: true };
}
