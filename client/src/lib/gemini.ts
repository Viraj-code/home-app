import { MealSuggestion } from "@/types";

export async function generateMealSuggestions(
  cuisines: string[] = [],
  dietary: string[] = [],
  mealType: string = "dinner"
): Promise<MealSuggestion[]> {
  try {
    const response = await fetch("/api/meals/suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cuisines,
        dietary,
        mealType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate meal suggestions");
    }

    const suggestions = await response.json();
    return Array.isArray(suggestions) ? suggestions : suggestions.meals || [];
  } catch (error) {
    console.error("Error generating meal suggestions:", error);
    throw error;
  }
}
