import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { useUser } from "@/hooks/use-auth";
import { LayoutSidebar } from "@/components/layout-sidebar";
import { Loader2 } from "lucide-react";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Vehicles from "@/pages/vehicles";
import CalendarPage from "@/pages/calendar";
import Customers from "@/pages/customers";
import EventsList from "@/pages/events-list";
import EventDetails from "@/pages/event-details";
import NotFound from "@/pages/not-found";
import CatalogPage from "@/pages/catalog";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <LayoutSidebar>
      <Component {...rest} />
    </LayoutSidebar>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/employees">
        <ProtectedRoute component={Employees} />
      </Route>
      <Route path="/events">
        <ProtectedRoute component={EventsList} />
      </Route>
      <Route path="/events/:id">
        <ProtectedRoute component={EventDetails} />
      </Route>
      <Route path="/calendar">
        <ProtectedRoute component={CalendarPage} />
      </Route>
      
      <Route path="/vehicles">
        <ProtectedRoute component={Vehicles} />
      </Route>
      <Route path="/catalog">
        <ProtectedRoute component={CatalogPage} />
      </Route>

      <Route path="/customers">
        <ProtectedRoute component={Customers} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
