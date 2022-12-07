import { Body, Controller, Get, Param, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserNotFoundException } from '../shared/exceptions/user-not-found.exception';
import { CreateMealDto } from './dto/create-meal.dto';
import { MealDto } from './dto/meal.dto';
import { MealsService } from './meals.service';
// import { authConfig } from './auth-config.development';
// import { TokenDto, UserDto, UsernameDto, UserSignupDto } from './dto';
// import { ConfirmEmailDto } from './dto/ConfirmEmail.dto';
// import { ForgotPasswordDto } from './dto/ForgotPassword.dto';
// import { ResendConfirmEmailDto } from './dto/ResendConfirmEmail.dto';
// import { ResetPasswordDto } from './dto/ResetPassword.dto';
// import { UserLoginDto } from './dto/UserLogin.dto';
// import { VerifyOtpDto } from './dto/VerifyOtp.dto';
// import { AuthService } from './services/auth.service';
// import { UserService } from './services/user.service';

@ApiTags('Meals')
@ApiBearerAuth()
@Controller('meals')
export class MealsController {
  constructor(private mealsService: MealsService) {}

  @ApiOperation({ summary: 'Create meal' })
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async create(@Request() req, @Body() createMealDto: CreateMealDto) {
    return this.mealsService.create(createMealDto, req.user);
  }

  @ApiOperation({ summary: 'list meal' })
  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async list(@Request() req) {
    return this.mealsService.list(req.user);
  }
}
