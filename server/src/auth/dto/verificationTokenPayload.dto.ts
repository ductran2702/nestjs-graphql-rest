import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerificationTokenPayloadDto {
  readonly email: { type: string, lowercase: true };
  readonly verifyEmailToken: string;
}
