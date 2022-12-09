import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MealSchema } from './meal.schema';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Meal', schema: MealSchema },
    ]),
  ],
  providers: [MealsService],
  controllers: [MealsController],
})
export class MealsModule {}
