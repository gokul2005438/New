import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/BottomNav";
import Landing from "@/pages/landing";
import ProfileSetup from "@/pages/profile-setup";
import Discover from "@/pages/discover";
import Matches from "@/pages/matches";
import Chat from "@/pages/chat";
import ProfilePage from "@/pages/profile";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show landing page while loading or not authenticated
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/" component={Discover} />
        <Route path="/profile-setup" component={ProfileSetup} />
        <Route path="/matches" component={Matches} />
        <Route path="/chat/:matchId" component={Chat} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
      {/* Show bottom nav on main pages, hide on chat and settings */}
      {!['/chat', '/settings', '/profile-setup'].some(path => window.location.pathname.startsWith(path)) && (
        <BottomNav />
      )}
    </>
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
