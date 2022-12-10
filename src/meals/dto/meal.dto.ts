import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsString } from 'class-validator';
import { Meal } from './meal.interface';
import { MealTime } from 'meals/dto/meal-time.enum';

export class MealDto {
  @IsString()
  readonly _id: string;

  @ApiProperty({ description: 'User Id (when defined)', type: () => 'string' })
  @IsString()
  readonly userId: string;

  @IsEnum(MealTime)
  readonly mealTime: MealTime;

  @IsString()
  @ApiProperty({
    description: "Meal's Display image url",
    type: () => 'string',
  })
  readonly imageUrl: string;

  @Type(() => Date)
  @IsDate()
  readonly date: Date;

  constructor(meal: Meal) {
    this._id = meal._id;
    this.userId = meal.userId;
    this.mealTime = meal.mealTime;
    this.date = meal.date;
  }
}
