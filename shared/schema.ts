import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("parent"), // parent, cook, driver, admin
  name: text("name").notNull(),
  avatar: text("avatar"),
  preferences: jsonb("preferences").default({}),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  cuisine: text("cuisine"),
  ingredients: text("ingredients").array(),
  instructions: text("instructions"),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  servings: integer("servings").default(4),
  prepTimeMinutes: integer("prep_time_minutes"),
  createdBy: integer("created_by").references(() => users.id),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  mealId: integer("meal_id").references(() => meals.id),
  plannedDate: text("planned_date").notNull(), // YYYY-MM-DD format
  mealType: text("meal_type").notNull(),
  completed: boolean("completed").default(false),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: text("location"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id),
  activityType: text("activity_type").notNull(), // sports, music, appointment, transport
  recurring: boolean("recurring").default(false),
  completed: boolean("completed").default(false),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  completed: boolean("completed").default(false),
});

export const shoppingItems = pgTable("shopping_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").references(() => shoppingLists.id),
  name: text("name").notNull(),
  quantity: text("quantity"),
  category: text("category"),
  completed: boolean("completed").default(false),
  addedBy: integer("added_by").references(() => users.id),
  relatedMeal: text("related_meal"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  createdBy: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdBy: true,
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({
  id: true,
  createdBy: true,
});

export const insertShoppingItemSchema = createInsertSchema(shoppingItems).omit({
  id: true,
  addedBy: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type InsertShoppingItem = z.infer<typeof insertShoppingItemSchema>;
