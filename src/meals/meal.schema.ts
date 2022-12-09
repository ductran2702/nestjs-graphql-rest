import { SchemaFactory, Schema, Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MealTime } from './meal-time.enum';

export type MealDocument = Meal & Document;

@Schema()
export class Meal {
  @Prop()
  readonly id: string;
  @Prop()
  readonly userId: string;
  @Prop()
  readonly mealTime: MealTime;
  @Prop()
  readonly imageUrl: string;
  @Prop()
  readonly date: Date;
}

export const MealSchema = SchemaFactory.createForClass(Meal);
