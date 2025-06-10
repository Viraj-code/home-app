import { useState, useEffect } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Sparkles, Clock, Users } from "lucide-react";
import { generateMealSuggestions } from "@/lib/openai";
import { EnrichedMealPlan, MealSuggestion } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

const mealTypeColors = {
  breakfast: "bg-red-50 border-red-200 text-red-800",
  lunch: "bg-blue-50 border-blue-200 text-blue-800", 
  dinner: "bg-green-50 border-green-200 text-green-800",
  snack: "bg-purple-50 border-purple-200 text-purple-800"
};

export function MealPlanner() {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  // Get current week's meal plans
  const { data: mealPlans, isLoading } = useQuery<EnrichedMealPlan[]>({
    queryKey: ["/api/meal-plans"],
  });

  const createMealMutation = useMutation({
    mutationFn: async (meal: MealSuggestion) => {
      return apiRequest("POST", "/api/meals", {
        ...meal,
        mealType: "dinner"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      toast({
        title: "Success",
        description: "Meal added successfully!"
      });
    }
  });

  const createMealPlanMutation = useMutation({
    mutationFn: async (data: { mealId: number; plannedDate: string; mealType: string; userId: number }) => {
      return apiRequest("POST", "/api/meal-plans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      toast({
        title: "Success", 
        description: "Meal planned successfully!"
      });
    }
  });

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const newSuggestions = await generateMealSuggestions(
        selectedCuisines,
        selectedDietary,
        "dinner"
      );
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate meal suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddMeal = async (suggestion: MealSuggestion) => {
    try {
      await createMealMutation.mutateAsync(suggestion);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getWeekDates = () => {
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const getMealsForDay = (date: string) => {
    if (!mealPlans) return [];
    return mealPlans.filter(plan => plan.plannedDate === date);
  };

  const weekDates = getWeekDates();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Meal Planner</CardTitle>
            <Skeleton className="h-8 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-8 mx-auto mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Meal Planner</CardTitle>
          <div className="flex items-center space-x-2">
            <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {isGenerating ? "Generating..." : "AI Suggestions"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>AI Meal Suggestions</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Preference Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuisine Preferences
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Italian", "Asian", "Mexican", "Mediterranean", "American", "Indian"].map((cuisine) => (
                        <Button
                          key={cuisine}
                          variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedCuisines(prev => 
                              prev.includes(cuisine) 
                                ? prev.filter(c => c !== cuisine)
                                : [...prev, cuisine]
                            );
                          }}
                        >
                          {cuisine}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Restrictions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb"].map((dietary) => (
                        <Button
                          key={dietary}
                          variant={selectedDietary.includes(dietary) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedDietary(prev => 
                              prev.includes(dietary) 
                                ? prev.filter(d => d !== dietary)
                                : [...prev, dietary]
                            );
                          }}
                        >
                          {dietary}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Generated Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Suggested Meals</h4>
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{suggestion.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge variant="secondary">{suggestion.cuisine}</Badge>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {suggestion.prepTimeMinutes} min
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Users className="w-3 h-3 mr-1" />
                                  {suggestion.servings} servings
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddMeal(suggestion)}
                              disabled={createMealMutation.isPending}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleGenerateSuggestions}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isGenerating ? "Generating..." : "Generate Suggestions"}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowSuggestions(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, index) => {
            const date = weekDates[index];
            const dayMeals = getMealsForDay(date);
            
            return (
              <div key={day} className="text-center">
                <div className="text-xs font-medium text-gray-500 mb-2">{day}</div>
                <div className="space-y-2 min-h-[120px]">
                  {dayMeals.map((mealPlan) => (
                    <div
                      key={mealPlan.id}
                      className={`rounded-lg p-2 cursor-move hover:shadow-md transition-shadow ${
                        mealTypeColors[mealPlan.mealType as keyof typeof mealTypeColors] || 
                        "bg-gray-50 border-gray-200 text-gray-800"
                      }`}
                      draggable
                    >
                      <div className="text-xs font-medium capitalize">
                        {mealPlan.mealType}
                      </div>
                      <div className="text-xs truncate">
                        {mealPlan.meal?.name || "Unknown Meal"}
                      </div>
                    </div>
                  ))}
                  
                  {dayMeals.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Plus className="w-4 h-4 text-gray-400 mx-auto" />
                      <div className="text-xs text-gray-400 mt-1">Add meal</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* AI Meal Suggestions Preview */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-2">AI Meal Suggestions</h4>
              <p className="text-xs text-gray-600">
                Click "AI Suggestions" to get personalized meal recommendations based on your family's preferences and dietary needs.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
