import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleColors = {
  parent: "bg-red-100 text-red-800",
  cook: "bg-blue-100 text-blue-800", 
  driver: "bg-green-100 text-green-800",
  admin: "bg-purple-100 text-purple-800"
};

export default function FamilyPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-600 mt-1">Manage your family members and their roles.</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((user: any) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <img 
                  src={user.avatar || "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
                  <Badge 
                    variant="outline" 
                    className={roleColors[user.role as keyof typeof roleColors] || roleColors.parent}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              
              {user.preferences && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Preferences</h4>
                  <div className="space-y-2">
                    {user.preferences.cuisines && user.preferences.cuisines.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500">Cuisines: </span>
                        <span className="text-xs text-gray-700">
                          {user.preferences.cuisines.join(", ")}
                        </span>
                      </div>
                    )}
                    {user.preferences.dietary && user.preferences.dietary.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500">Dietary: </span>
                        <span className="text-xs text-gray-700">
                          {user.preferences.dietary.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Family Stats */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Family Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{users?.length || 0}</div>
                <div className="text-sm text-gray-500">Total Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {users?.filter((u: any) => u.role === 'parent').length || 0}
                </div>
                <div className="text-sm text-gray-500">Parents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {users?.filter((u: any) => u.role === 'cook').length || 0}
                </div>
                <div className="text-sm text-gray-500">Cooks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {users?.filter((u: any) => u.role === 'driver').length || 0}
                </div>
                <div className="text-sm text-gray-500">Drivers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
