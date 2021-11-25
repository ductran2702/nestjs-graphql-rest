import { JwtModule, JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { EmailService } from '../../shared/services/email.service';
import authConfig from '../auth-config.development';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

describe('AuthService', () => {
  let service: AuthService;
  beforeAll(async () => {
    const mockEmailService = {
      login: jest.fn(),
      forgotPassword: jest.fn(),
      register: jest.fn(),
      resetPassword: jest.fn(),
      confirmEmail: jest.fn(),
      resendConfirmationLinkEmail: jest.fn(),
    };
    const mockUserService = {
      login: jest.fn(),
      forgotPassword: jest.fn(),
      register: jest.fn(),
      resetPassword: jest.fn(),
      confirmEmail: jest.fn(),
      resendConfirmationLinkEmail: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: authConfig.jwtSecretKey,
          signOptions: { expiresIn: '7d' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
      exports: [JwtModule],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
