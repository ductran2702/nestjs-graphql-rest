import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'auth/models';
import { Model, Types } from 'mongoose';
import { CreateMealDto } from './dto/create-meal.dto';
import { Meal } from './models/meal.interface';

@Injectable()
export class MealsService {

  constructor(
    @InjectModel('Meal') private readonly mealModel: Model<Meal>
  ) {}

  async create(newMeal: CreateMealDto, user: User): Promise<Meal> {
    const { userId } = user;
    const objectId = Types.ObjectId();
    
    const createdMeal = new this.mealModel({
      ...newMeal,
      _id: objectId,
      userId,
    });

    return createdMeal.save();
  }

  async list(user: User): Promise<Meal[]> {
    const { userId } = user;
    return this.mealModel.find({ userId });
  }

}
