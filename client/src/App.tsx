import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MenuPage from "@/pages/menu-page";
import StaffDashboard from "@/pages/staff-dashboard";
import AdminPanel from "@/pages/admin-panel";
import ChatAssistant from "@/pages/chat-assistant";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/menu/:tableId" component={MenuPage} />
      <Route path="/chat" component={ChatAssistant} />
      <ProtectedRoute path="/staff" component={StaffDashboard} requiredRole={["staff", "admin"]} />
      <ProtectedRoute path="/admin" component={AdminPanel} requiredRole={["admin"]} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
