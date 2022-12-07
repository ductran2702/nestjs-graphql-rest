import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MealTime } from 'meals/models/meal-time.enum';
import { Meal } from 'meals/models/meal.interface';

export class MealDto {
  readonly id?: string;

  @ApiProperty({ description: 'User Id (when defined)', type: () => 'string' })
  // readonly userId: string;

  readonly mealTime: MealTime;
  @IsString()
  @ApiProperty({
    description: "Meal's Display image url",
    type: () => 'string',
  })
  readonly imageUrl: string;
  
  readonly date: Date;

  constructor(meal: Meal) {
    //super(user);
    this.id = meal.id;
    // this.userId = meal.userId;
    this.mealTime = meal.mealTime;
    this.date = meal.date;
  }
}
