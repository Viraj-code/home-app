import { MealPlanner } from "@/components/meal-planner";

export default function MealPlanningPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meal Planning</h1>
        <p className="text-gray-600 mt-1">Plan your family's meals for the week with AI-powered suggestions.</p>
      </div>
      
      <MealPlanner />
    </div>
  );
}
