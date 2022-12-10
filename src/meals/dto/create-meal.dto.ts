import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsString } from 'class-validator';
import { MealTime } from 'meals/dto/meal-time.enum';

export class CreateMealDto {
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
