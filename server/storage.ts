import { 
  users, meals, mealPlans, activities, shoppingLists, shoppingItems,
  type User, type InsertUser, type Meal, type InsertMeal, 
  type MealPlan, type InsertMealPlan, type Activity, type InsertActivity,
  type ShoppingList, type InsertShoppingList, type ShoppingItem, type InsertShoppingItem
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Meal operations
  getMeal(id: number): Promise<Meal | undefined>;
  getAllMeals(): Promise<Meal[]>;
  createMeal(meal: InsertMeal, createdBy: number): Promise<Meal>;
  getMealsByCreator(userId: number): Promise<Meal[]>;
  
  // Meal plan operations
  getMealPlan(id: number): Promise<MealPlan | undefined>;
  getMealPlansByUser(userId: number): Promise<MealPlan[]>;
  getMealPlansByDate(date: string): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: number, updates: Partial<MealPlan>): Promise<MealPlan | undefined>;
  deleteMealPlan(id: number): Promise<boolean>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getAllActivities(): Promise<Activity[]>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;
  getActivitiesByDate(date: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity, createdBy: number): Promise<Activity>;
  updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Shopping list operations
  getShoppingList(id: number): Promise<ShoppingList | undefined>;
  getAllShoppingLists(): Promise<ShoppingList[]>;
  getShoppingListsByUser(userId: number): Promise<ShoppingList[]>;
  createShoppingList(list: InsertShoppingList, createdBy: number): Promise<ShoppingList>;
  updateShoppingList(id: number, updates: Partial<ShoppingList>): Promise<ShoppingList | undefined>;
  deleteShoppingList(id: number): Promise<boolean>;
  
  // Shopping item operations
  getShoppingItem(id: number): Promise<ShoppingItem | undefined>;
  getShoppingItemsByList(listId: number): Promise<ShoppingItem[]>;
  createShoppingItem(item: InsertShoppingItem, addedBy: number): Promise<ShoppingItem>;
  updateShoppingItem(id: number, updates: Partial<ShoppingItem>): Promise<ShoppingItem | undefined>;
  deleteShoppingItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private meals: Map<number, Meal> = new Map();
  private mealPlans: Map<number, MealPlan> = new Map();
  private activities: Map<number, Activity> = new Map();
  private shoppingLists: Map<number, ShoppingList> = new Map();
  private shoppingItems: Map<number, ShoppingItem> = new Map();
  
  private currentUserId = 1;
  private currentMealId = 1;
  private currentMealPlanId = 1;
  private currentActivityId = 1;
  private currentShoppingListId = 1;
  private currentShoppingItemId = 1;

  constructor() {
    // Initialize with sample family
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample family members
    const parent: User = {
      id: this.currentUserId++,
      username: "sarah_johnson",
      password: "hashed_password",
      role: "parent",
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      preferences: { cuisines: ["Italian", "Mediterranean"], dietary: ["Vegetarian"] }
    };
    
    const cook: User = {
      id: this.currentUserId++,
      username: "mike_johnson",
      password: "hashed_password",
      role: "cook",
      name: "Mike Johnson",
      avatar: "",
      preferences: { cuisines: ["Asian", "Mexican"] }
    };
    
    const child: User = {
      id: this.currentUserId++,
      username: "emma_johnson",
      password: "hashed_password",
      role: "parent",
      name: "Emma Johnson",
      avatar: "",
      preferences: { cuisines: ["Italian"], dietary: [] }
    };

    this.users.set(parent.id, parent);
    this.users.set(cook.id, cook);
    this.users.set(child.id, child);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: this.currentUserId++ };
    this.users.set(user.id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Meal operations
  async getMeal(id: number): Promise<Meal | undefined> {
    return this.meals.get(id);
  }

  async getAllMeals(): Promise<Meal[]> {
    return Array.from(this.meals.values());
  }

  async createMeal(insertMeal: InsertMeal, createdBy: number): Promise<Meal> {
    const meal: Meal = { ...insertMeal, id: this.currentMealId++, createdBy };
    this.meals.set(meal.id, meal);
    return meal;
  }

  async getMealsByCreator(userId: number): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(meal => meal.createdBy === userId);
  }

  // Meal plan operations
  async getMealPlan(id: number): Promise<MealPlan | undefined> {
    return this.mealPlans.get(id);
  }

  async getMealPlansByUser(userId: number): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values()).filter(plan => plan.userId === userId);
  }

  async getMealPlansByDate(date: string): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values()).filter(plan => plan.plannedDate === date);
  }

  async createMealPlan(insertMealPlan: InsertMealPlan): Promise<MealPlan> {
    const mealPlan: MealPlan = { ...insertMealPlan, id: this.currentMealPlanId++ };
    this.mealPlans.set(mealPlan.id, mealPlan);
    return mealPlan;
  }

  async updateMealPlan(id: number, updates: Partial<MealPlan>): Promise<MealPlan | undefined> {
    const existing = this.mealPlans.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.mealPlans.set(id, updated);
    return updated;
  }

  async deleteMealPlan(id: number): Promise<boolean> {
    return this.mealPlans.delete(id);
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(activity => activity.assignedTo === userId);
  }

  async getActivitiesByDate(date: string): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(activity => 
      activity.startTime.toISOString().split('T')[0] === date
    );
  }

  async createActivity(insertActivity: InsertActivity, createdBy: number): Promise<Activity> {
    const activity: Activity = { ...insertActivity, id: this.currentActivityId++, createdBy };
    this.activities.set(activity.id, activity);
    return activity;
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    const existing = this.activities.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.activities.set(id, updated);
    return updated;
  }

  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Shopping list operations
  async getShoppingList(id: number): Promise<ShoppingList | undefined> {
    return this.shoppingLists.get(id);
  }

  async getAllShoppingLists(): Promise<ShoppingList[]> {
    return Array.from(this.shoppingLists.values());
  }

  async getShoppingListsByUser(userId: number): Promise<ShoppingList[]> {
    return Array.from(this.shoppingLists.values()).filter(list => list.createdBy === userId);
  }

  async createShoppingList(insertList: InsertShoppingList, createdBy: number): Promise<ShoppingList> {
    const list: ShoppingList = { ...insertList, id: this.currentShoppingListId++, createdBy };
    this.shoppingLists.set(list.id, list);
    return list;
  }

  async updateShoppingList(id: number, updates: Partial<ShoppingList>): Promise<ShoppingList | undefined> {
    const existing = this.shoppingLists.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.shoppingLists.set(id, updated);
    return updated;
  }

  async deleteShoppingList(id: number): Promise<boolean> {
    return this.shoppingLists.delete(id);
  }

  // Shopping item operations
  async getShoppingItem(id: number): Promise<ShoppingItem | undefined> {
    return this.shoppingItems.get(id);
  }

  async getShoppingItemsByList(listId: number): Promise<ShoppingItem[]> {
    return Array.from(this.shoppingItems.values()).filter(item => item.listId === listId);
  }

  async createShoppingItem(insertItem: InsertShoppingItem, addedBy: number): Promise<ShoppingItem> {
    const item: ShoppingItem = { ...insertItem, id: this.currentShoppingItemId++, addedBy };
    this.shoppingItems.set(item.id, item);
    return item;
  }

  async updateShoppingItem(id: number, updates: Partial<ShoppingItem>): Promise<ShoppingItem | undefined> {
    const existing = this.shoppingItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.shoppingItems.set(id, updated);
    return updated;
  }

  async deleteShoppingItem(id: number): Promise<boolean> {
    return this.shoppingItems.delete(id);
  }
}

export const storage = new MemStorage();
