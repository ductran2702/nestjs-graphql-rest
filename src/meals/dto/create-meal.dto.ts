import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsString } from 'class-validator';
import { MealTime } from 'meals/models/meal-time.enum';

export class CreateMealDto {
  // readonly id?: string;

  // @ApiProperty({ description: 'User Id (when defined)', type: () => 'string' })
  // readonly userId: string;
  @IsEnum(MealTime)
  readonly mealTime: MealTime;

  @IsString()
  @ApiProperty({
    description: "Meal's Display image url",
    type: () => 'string',
  })
  readonly imageUrl?: string;
  
  @Type(() => Date)
  @IsDate()
  readonly date: Date;
}
