import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Plus, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertActivitySchema } from "@shared/schema";
import { EnrichedActivity } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const activityColors = {
  sports: "bg-blue-100 text-blue-800 border-blue-200",
  music: "bg-purple-100 text-purple-800 border-purple-200",
  appointment: "bg-green-100 text-green-800 border-green-200",
  transport: "bg-orange-100 text-orange-800 border-orange-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

export function ActivityCalendar() {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const { data: activities, isLoading } = useQuery<EnrichedActivity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const activityFormSchema = insertActivitySchema.extend({
    startDate: z.string(),
    startTime: z.string(),
    endTime: z.string().optional(),
  });

  const form = useForm<z.infer<typeof activityFormSchema>>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      activityType: "other",
      startDate: selectedDate,
      startTime: "09:00",
      endTime: "10:00",
      assignedTo: undefined,
      recurring: false,
      completed: false,
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: z.infer<typeof activityFormSchema>) => {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = data.endTime ? new Date(`${data.startDate}T${data.endTime}`) : null;
      
      return apiRequest("POST", "/api/activities", {
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime?.toISOString(),
        assignedTo: data.assignedTo || null,
        activityType: data.activityType,
        recurring: data.recurring,
        completed: data.completed,
        createdBy: 1, // Current user
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setShowForm(false);
      form.reset();
      toast({
        title: "Success",
        description: "Activity created successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create activity. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof activityFormSchema>) => {
    createActivityMutation.mutate(data);
  };

  const getTodaysActivities = () => {
    if (!activities) return [];
    const today = new Date().toISOString().split('T')[0];
    return activities.filter(activity => 
      new Date(activity.startTime).toISOString().split('T')[0] === today
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const getUpcomingActivities = () => {
    if (!activities) return [];
    const today = new Date();
    return activities.filter(activity => 
      new Date(activity.startTime) > today
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 5);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todaysActivities = getTodaysActivities();
  const upcomingActivities = getUpcomingActivities();

  return (
    <div className="space-y-6">
      {/* Today's Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Today's Activities</span>
            </CardTitle>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Activity</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Soccer practice" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Weekly team practice session" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="activityType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="music">Music</SelectItem>
                                <SelectItem value="appointment">Appointment</SelectItem>
                                <SelectItem value="transport">Transport</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time (Optional)</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Riverside Park" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign To (Optional)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select family member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users?.map((user: any) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        disabled={createActivityMutation.isPending}
                        className="flex-1"
                      >
                        {createActivityMutation.isPending ? "Creating..." : "Create Activity"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {todaysActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No activities scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    activityColors[activity.activityType as keyof typeof activityColors]?.split(' ')[0] || 'bg-gray-200'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={activityColors[activity.activityType as keyof typeof activityColors] || activityColors.other}>
                          {activity.activityType}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(activity.startTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                      {activity.assignedUser && (
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {activity.assignedUser.name}
                        </span>
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
        </CardContent>
      </Card>

      {/* Upcoming Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingActivities.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No upcoming activities scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activityColors[activity.activityType as keyof typeof activityColors]?.split(' ')[0] || 'bg-gray-200'
                    }`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(activity.startTime)} at {formatTime(activity.startTime)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={activityColors[activity.activityType as keyof typeof activityColors] || activityColors.other}>
                    {activity.activityType}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
