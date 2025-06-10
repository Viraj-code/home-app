export interface MealSuggestion {
  name: string;
  description: string;
  cuisine: string;
  ingredients: string[];
  instructions: string;
  prepTimeMinutes: number;
  servings: number;
}

export interface EnrichedMealPlan {
  id: number;
  userId: number | null;
  mealId: number | null;
  plannedDate: string;
  mealType: string;
  completed: boolean | null;
  meal?: {
    id: number;
    name: string;
    description: string | null;
    cuisine: string | null;
    ingredients: string[] | null;
    instructions: string | null;
    mealType: string;
    servings: number | null;
    prepTimeMinutes: number | null;
    createdBy: number | null;
  };
}

export interface EnrichedActivity {
  id: number;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  location: string | null;
  assignedTo: number | null;
  createdBy: number | null;
  activityType: string;
  recurring: boolean | null;
  completed: boolean | null;
  assignedUser?: {
    id: number;
    name: string;
    role: string;
  } | null;
  createdByUser?: {
    id: number;
    name: string;
    role: string;
  } | null;
}

export interface EnrichedShoppingList {
  id: number;
  name: string;
  createdBy: number | null;
  completed: boolean | null;
  items: {
    id: number;
    listId: number | null;
    name: string;
    quantity: string | null;
    category: string | null;
    completed: boolean | null;
    addedBy: number | null;
    relatedMeal: string | null;
  }[];
}
