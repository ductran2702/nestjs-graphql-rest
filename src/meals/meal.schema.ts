import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { MealTime } from './models/meal-time.enum';

export const MealSchema = new Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
     userId: { type: String },
     mealTime:  { type: MealTime },
     date: Date,
    
  },
  { timestamps: true },
);
