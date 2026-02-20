import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-auth";
import { LayoutSidebar } from "@/components/layout-sidebar";
import { Loader2 } from "lucide-react";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import EventsList from "@/pages/events-list";
import EventDetails from "@/pages/event-details";
import NotFound from "@/pages/not-found";

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
      
      {/* Placeholder for other routes if needed later */}
      <Route path="/vehicles">
        <ProtectedRoute component={() => <div className="p-8">Módulo Frota (Em breve)</div>} />
      </Route>
      <Route path="/catalog">
        <ProtectedRoute component={() => <div className="p-8">Módulo Catálogo (Em breve)</div>} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
