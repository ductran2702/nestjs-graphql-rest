import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { MealTime } from 'meals/types/meal-time.enum';

export class UpdateMealDto {
  @ApiProperty({ description: 'meal\'s id', type: () => 'string' })
  @IsString()
  readonly _id: string;

  @IsEnum(MealTime)
  @IsOptional()
  readonly mealTime?: MealTime;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Meal's Display image url",
    type: () => 'string',
  })
  readonly imageUrl?: string;
  
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  readonly date?: Date;
}
