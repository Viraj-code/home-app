import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMealSchema, insertMealPlanSchema, insertActivitySchema, insertShoppingListSchema, insertShoppingItemSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Meals routes
  app.get("/api/meals", async (req, res) => {
    try {
      const meals = await storage.getAllMeals();
      res.json(meals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meals" });
    }
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const validatedData = insertMealSchema.parse(req.body);
      const createdBy = req.body.createdBy || 1; // Default to first user
      const meal = await storage.createMeal(validatedData, createdBy);
      res.status(201).json(meal);
    } catch (error) {
      res.status(400).json({ message: "Invalid meal data", error: error.message });
    }
  });

  // AI meal suggestions
  app.post("/api/meals/suggestions", async (req, res) => {
    try {
      const { cuisines = [], dietary = [], mealType = "dinner" } = req.body;
      
      const prompt = `Generate 5 ${mealType} meal suggestions with the following preferences:
      - Cuisines: ${cuisines.join(", ") || "any"}
      - Dietary restrictions: ${dietary.join(", ") || "none"}
      
      For each meal, provide:
      - name: string
      - description: string (brief)
      - cuisine: string
      - ingredients: array of strings
      - instructions: string (brief cooking instructions)
      - prepTimeMinutes: number
      - servings: number (default 4)
      
      Return as JSON array of meal objects.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a helpful cooking assistant. Generate realistic meal suggestions based on user preferences. Return valid JSON only."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const suggestions = JSON.parse(response.choices[0].message.content);
      res.json(suggestions.meals || suggestions);
    } catch (error) {
      console.error("AI meal suggestion error:", error);
      res.status(500).json({ message: "Failed to generate meal suggestions" });
    }
  });

  // Meal plans routes
  app.get("/api/meal-plans", async (req, res) => {
    try {
      const { userId, date } = req.query;
      let mealPlans;
      
      if (userId) {
        mealPlans = await storage.getMealPlansByUser(parseInt(userId as string));
      } else if (date) {
        mealPlans = await storage.getMealPlansByDate(date as string);
      } else {
        // Get all meal plans for the current week
        const today = new Date();
        const week = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const plans = await storage.getMealPlansByDate(date.toISOString().split('T')[0]);
          week.push(...plans);
        }
        mealPlans = week;
      }
      
      // Enrich with meal data
      const enrichedPlans = await Promise.all(
        mealPlans.map(async (plan) => {
          const meal = await storage.getMeal(plan.mealId!);
          return { ...plan, meal };
        })
      );
      
      res.json(enrichedPlans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    try {
      const validatedData = insertMealPlanSchema.parse(req.body);
      const mealPlan = await storage.createMealPlan(validatedData);
      res.status(201).json(mealPlan);
    } catch (error) {
      res.status(400).json({ message: "Invalid meal plan data", error: error.message });
    }
  });

  app.put("/api/meal-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const mealPlan = await storage.updateMealPlan(id, updates);
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.json(mealPlan);
    } catch (error) {
      res.status(400).json({ message: "Failed to update meal plan" });
    }
  });

  app.delete("/api/meal-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMealPlan(id);
      if (!deleted) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meal plan" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const { userId, date } = req.query;
      let activities;
      
      if (userId) {
        activities = await storage.getActivitiesByUser(parseInt(userId as string));
      } else if (date) {
        activities = await storage.getActivitiesByDate(date as string);
      } else {
        activities = await storage.getAllActivities();
      }
      
      // Enrich with user data
      const enrichedActivities = await Promise.all(
        activities.map(async (activity) => {
          const assignedUser = activity.assignedTo ? await storage.getUser(activity.assignedTo) : null;
          const createdByUser = activity.createdBy ? await storage.getUser(activity.createdBy) : null;
          return { ...activity, assignedUser, createdByUser };
        })
      );
      
      res.json(enrichedActivities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const createdBy = req.body.createdBy || 1;
      const activity = await storage.createActivity(validatedData, createdBy);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data", error: error.message });
    }
  });

  app.put("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const activity = await storage.updateActivity(id, updates);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Failed to update activity" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteActivity(id);
      if (!deleted) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Shopping lists routes
  app.get("/api/shopping-lists", async (req, res) => {
    try {
      const lists = await storage.getAllShoppingLists();
      
      // Enrich with items
      const enrichedLists = await Promise.all(
        lists.map(async (list) => {
          const items = await storage.getShoppingItemsByList(list.id);
          return { ...list, items };
        })
      );
      
      res.json(enrichedLists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shopping lists" });
    }
  });

  app.post("/api/shopping-lists", async (req, res) => {
    try {
      const validatedData = insertShoppingListSchema.parse(req.body);
      const createdBy = req.body.createdBy || 1;
      const list = await storage.createShoppingList(validatedData, createdBy);
      res.status(201).json(list);
    } catch (error) {
      res.status(400).json({ message: "Invalid shopping list data", error: error.message });
    }
  });

  // Generate shopping list from meal plans
  app.post("/api/shopping-lists/generate", async (req, res) => {
    try {
      const { startDate, endDate, userId = 1 } = req.body;
      
      // Get meal plans for date range
      const mealPlans = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const plans = await storage.getMealPlansByDate(dateStr);
        mealPlans.push(...plans);
      }
      
      // Collect ingredients from all planned meals
      const allIngredients = new Set<string>();
      for (const plan of mealPlans) {
        const meal = await storage.getMeal(plan.mealId!);
        if (meal && meal.ingredients) {
          meal.ingredients.forEach(ingredient => allIngredients.add(ingredient));
        }
      }
      
      // Create shopping list
      const listName = `Shopping List ${startDate} to ${endDate}`;
      const shoppingList = await storage.createShoppingList({ name: listName }, userId);
      
      // Add items to the list
      const items = [];
      for (const ingredient of allIngredients) {
        const item = await storage.createShoppingItem({
          listId: shoppingList.id,
          name: ingredient,
          category: "ingredient",
          completed: false
        }, userId);
        items.push(item);
      }
      
      res.status(201).json({ ...shoppingList, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate shopping list" });
    }
  });

  // Shopping items routes
  app.post("/api/shopping-items", async (req, res) => {
    try {
      const validatedData = insertShoppingItemSchema.parse(req.body);
      const addedBy = req.body.addedBy || 1;
      const item = await storage.createShoppingItem(validatedData, addedBy);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid shopping item data", error: error.message });
    }
  });

  app.put("/api/shopping-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const item = await storage.updateShoppingItem(id, updates);
      if (!item) {
        return res.status(404).json({ message: "Shopping item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to update shopping item" });
    }
  });

  app.delete("/api/shopping-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteShoppingItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Shopping item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete shopping item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
