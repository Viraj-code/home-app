import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import MealPlanningPage from "@/pages/meal-planning";
import ActivitiesPage from "@/pages/activities";
import ShoppingListsPage from "@/pages/shopping-lists";
import FamilyPage from "@/pages/family";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/meal-planning" component={MealPlanningPage} />
      <Route path="/activities" component={ActivitiesPage} />
      <Route path="/shopping-lists" component={ShoppingListsPage} />
      <Route path="/family" component={FamilyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppLayout />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
