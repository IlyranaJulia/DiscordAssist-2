import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/ui/navigation";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import BotDetail from "@/pages/bot-detail";
import TestAuth from "@/pages/test-auth";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Handle Safari authentication return
    const returnUrl = sessionStorage.getItem('discord_auth_return_url');
    if (returnUrl && location === '/dashboard') {
      sessionStorage.removeItem('discord_auth_return_url');
      // Force refresh user data after Safari redirect
      queryClient.invalidateQueries({ queryKey: ['/api/user/me'] });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/bot/:id" component={BotDetail} />
          <Route path="/test-auth" component={TestAuth} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
