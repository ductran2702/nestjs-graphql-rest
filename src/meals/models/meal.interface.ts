import type { Document } from 'mongoose';
import { MealTime } from './meal-time.enum';

export interface Meal extends Document {
  readonly userId: string;
  readonly mealTime: MealTime;
  readonly imageUrl: string;
  readonly date: Date;
}
