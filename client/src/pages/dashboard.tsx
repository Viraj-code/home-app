import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Utensils, 
  ShoppingCart, 
  Calendar, 
  Users, 
  Bell, 
  Plus,
  Clock,
  MapPin,
  User,
  Car,
  CalendarPlus,
  ShoppingBasket
} from "lucide-react";
import { EnrichedMealPlan, EnrichedActivity, EnrichedShoppingList } from "@/types";
import { useAuth } from "@/hooks/use-auth";

const activityColors = {
  sports: "bg-blue-100 text-blue-800",
  music: "bg-purple-100 text-purple-800", 
  appointment: "bg-green-100 text-green-800",
  transport: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800"
};

const roleColors = {
  parent: "bg-red-500",
  cook: "bg-blue-500",
  driver: "bg-green-500",
  admin: "bg-purple-500"
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: mealPlans, isLoading: mealsLoading } = useQuery<EnrichedMealPlan[]>({
    queryKey: ["/api/meal-plans"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<EnrichedActivity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: shoppingLists, isLoading: shoppingLoading } = useQuery<EnrichedShoppingList[]>({
    queryKey: ["/api/shopping-lists"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Get today's activities
  const getTodaysActivities = () => {
    if (!activities) return [];
    const today = new Date().toISOString().split('T')[0];
    return activities.filter(activity => 
      new Date(activity.startTime).toISOString().split('T')[0] === today
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate stats
  const thisWeeksMeals = mealPlans?.length || 0;
  const totalShoppingItems = shoppingLists?.reduce((acc, list) => acc + list.items.length, 0) || 0;
  const thisWeeksActivities = activities?.filter(activity => {
    const activityDate = new Date(activity.startTime);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return activityDate >= today && activityDate <= weekFromNow;
  }).length || 0;
  const familyMembers = users?.length || 0;

  const todaysActivities = getTodaysActivities();
  const activeShoppingList = shoppingLists?.[0];

  if (mealsLoading || activitiesLoading || shoppingLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Family Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your family today.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week's Meals</p>
                <p className="text-3xl font-bold text-gray-900">{thisWeeksMeals}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Utensils className="text-secondary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shopping Items</p>
                <p className="text-3xl font-bold text-gray-900">{totalShoppingItems}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-accent w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activities This Week</p>
                <p className="text-3xl font-bold text-gray-900">{thisWeeksActivities}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Family Members</p>
                <p className="text-3xl font-bold text-gray-900">{familyMembers}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area - Placeholder for Meal Planner */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Meal Planner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">Visit the Meal Planning page to create your weekly meal schedule</p>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  Go to Meal Planning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Today's Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {todaysActivities.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No activities scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysActivities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        roleColors[activity.assignedUser?.role as keyof typeof roleColors] || 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(activity.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                          {activity.assignedUser && (
                            <span>{activity.assignedUser.name}</span>
                          )}
                          {activity.location && (
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {activity.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="link" className="w-full mt-4 text-primary hover:text-primary/80">
                View Full Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Shopping List Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shopping List</CardTitle>
                {activeShoppingList && (
                  <Badge variant="outline" className="bg-accent/10 text-accent">
                    Auto-generated
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!activeShoppingList ? (
                <div className="text-center py-4 text-gray-500">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No shopping lists yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeShoppingList.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        checked={item.completed || false}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        readOnly
                      />
                      <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="text-xs text-gray-500">({item.quantity})</span>
                      )}
                    </div>
                  ))}
                  
                  {activeShoppingList.items.length > 4 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{activeShoppingList.items.length - 4} more items
                    </p>
                  )}
                </div>
              )}

              <Button variant="link" className="w-full mt-4 text-primary hover:text-primary/80">
                View Full Shopping List
              </Button>
            </CardContent>
          </Card>

          {/* Family Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="p-3 h-auto flex-col">
                  <Utensils className="text-secondary w-5 h-5 mb-1" />
                  <div className="text-xs">Add Meal</div>
                </Button>
                <Button variant="outline" className="p-3 h-auto flex-col">
                  <CalendarPlus className="text-purple-600 w-5 h-5 mb-1" />
                  <div className="text-xs">Add Activity</div>
                </Button>
                <Button variant="outline" className="p-3 h-auto flex-col">
                  <Car className="text-blue-600 w-5 h-5 mb-1" />
                  <div className="text-xs">Schedule Ride</div>
                </Button>
                <Button variant="outline" className="p-3 h-auto flex-col">
                  <ShoppingBasket className="text-accent w-5 h-5 mb-1" />
                  <div className="text-xs">Add Item</div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
