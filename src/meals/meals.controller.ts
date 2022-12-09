import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealsService } from './meals.service';

@ApiTags('Meals')
@ApiBearerAuth()
@Controller('meals')
export class MealsController {
  constructor(private mealsService: MealsService) {}

  @ApiOperation({ summary: 'Create meal' })
  @UseGuards(AuthGuard('jwt'))
  @Post('')
  async create(@Request() req, @Body() createMeal: CreateMealDto) {
    return this.mealsService.create(createMeal, req.user);
  }

  @ApiOperation({ summary: 'list meal' })
  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async findAllByUser(@Request() req) {
    return this.mealsService.findAllByUser(req.user);
  }

  @ApiOperation({ summary: 'update meal' })
  @UseGuards(AuthGuard('jwt'))
  @Put('')
  async update(@Request() req, @Body() updateMeal: UpdateMealDto) {
    return this.mealsService.update(updateMeal, req.user);
  }

  @ApiOperation({ summary: 'update meal' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('')
  @ApiQuery({ name: 'id', type: String })
  async delete(@Request() req, @Query('id') id: string,) {
    return this.mealsService.delete(id, req.user);
  }
}
