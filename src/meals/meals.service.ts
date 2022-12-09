import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'auth/models';
import moment from 'moment';
import { Model, Types } from 'mongoose';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { Meal } from './meal.schema';
import { MealTime } from './meal-time.enum';

@Injectable()
export class MealsService {

  constructor(
    @InjectModel('Meal') private readonly mealModel: Model<Meal>
  ) {}

  async checkDateTime(newDate?: Date, newTime?: MealTime, oldMeal?: Meal): Promise<boolean> {
    const filter: any = {};
    if (newDate) {
      filter.date = {
        $gte: moment(newDate).startOf('day').toDate(),
        $lt: moment(newDate).endOf('day').toDate(),
      }
    } else {
      filter.date = {
        $gte: moment(oldMeal?.date).startOf('day').toDate(),
        $lt: moment(oldMeal?.date).endOf('day').toDate(),
      }
    }

    if (newTime) {
      filter.mealTime = newTime;
    } else {
      filter.mealTime = oldMeal?.mealTime;
    }

    const meal = await this.mealModel.findOne(filter);
    return !meal;
  }

  async create(newMeal: CreateMealDto, user: User): Promise<Meal> {
    const { userId } = user;
    const objectId = Types.ObjectId();

    const valid = await this.checkDateTime(newMeal.date, newMeal.mealTime);
    if (!valid) {
      throw new HttpException('Already created meal date time', 401);
    }

    const createMeal = new this.mealModel({
      ...newMeal,
      _id: objectId,
      userId,
    });

    const created = await createMeal.save()
    return created;
  }

  async update(updateMeal: UpdateMealDto, user: User): Promise<Meal> {
    const { userId } = user;
    const oldMeal = await this.mealModel.findOne({
      userId,
      _id: updateMeal.id,
    });
    if (!oldMeal) {
      throw new HttpException('Meal not found', 404);
    }

    if (updateMeal.date || updateMeal.mealTime) {
      const valid = await this.checkDateTime(updateMeal.date, updateMeal.mealTime, oldMeal);
      if (!valid) {
        throw new HttpException('Already created meal date time', 401);
      }
    }

    const updatedMeal = await this.mealModel.findByIdAndUpdate({
      _id: updateMeal.id,
    }, updateMeal, { 
      new: true 
    }) as Meal;

    return updatedMeal;
  }

  async findAllByUser(user: User): Promise<Meal[]> {
    const { userId } = user;
    return this.mealModel.find({ userId });
  }

  async delete(id: string, user: User): Promise<boolean> {
    const { userId } = user;
    const deleted = await this.mealModel.findOneAndRemove({
      _id: id,
      userId
    });

    return !!deleted;
  }
}
