import { MealTime } from "./meal-time.enum"

interface DateFilter {
  $gte: Date
  $lt: Date
}

export interface DateMealTimeFilter {
  date?: DateFilter
  mealTime?: MealTime
}