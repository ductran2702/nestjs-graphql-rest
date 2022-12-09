import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsString } from 'class-validator';
import { Meal } from 'meals/meal.schema';
import { MealTime } from 'meals/meal-time.enum';

export class MealDto {
  @IsString()
  readonly id: string;

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
    this.id = meal.id;
    this.userId = meal.userId;
    this.mealTime = meal.mealTime;
    this.date = meal.date;
  }
}
