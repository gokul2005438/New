import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SwipeCard } from "@/components/SwipeCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, Heart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UserWithProfile } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Discover() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [swipedUsers, setSwipedUsers] = useState<Set<string>>(new Set());

  // Fetch potential matches
  const { data: potentialMatches = [], isLoading } = useQuery<UserWithProfile[]>({
    queryKey: ["/api/discover"],
    refetchOnWindowFocus: false,
  });

  // Fetch daily swipe count
  const { data: swipeData } = useQuery<{ count: number; limit: number }>({
    queryKey: ["/api/swipes/daily"],
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ swipedId, direction }: { swipedId: string; direction: 'like' | 'pass' }) => {
      return await apiRequest("POST", "/api/swipes", { swipedId, direction });
    },
    onSuccess: (data, variables) => {
      setSwipedUsers((prev) => new Set([...prev, variables.swipedId]));
      queryClient.invalidateQueries({ queryKey: ["/api/swipes/daily"] });

      if (data.isMatch) {
        // Show match celebration
        toast({
          title: "🎉 It's a Match!",
          description: "You both liked each other! Start chatting now.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (userId: string, direction: 'like' | 'pass') => {
    swipeMutation.mutate({ swipedId: userId, direction });
  };

  const visibleUsers = potentialMatches.filter((u) => !swipedUsers.has(u.id));
  const hasReachedLimit = swipeData && swipeData.count >= swipeData.limit;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent mx-auto animate-pulse" />
          <p className="text-muted-foreground">Finding potential matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="font-display text-xl font-bold">Discover</h1>
          </div>

          <div className="flex items-center gap-2">
            {swipeData && (
              <div className="text-sm text-muted-foreground">
                {swipeData.count}/{swipeData.limit} swipes today
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto">
          {hasReachedLimit ? (
            <Card className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold">Daily Limit Reached</h3>
                <p className="text-muted-foreground">
                  You've used all your free swipes for today. Come back tomorrow or upgrade to Premium for unlimited swipes!
                </p>
              </div>
              <Button className="w-full" data-testid="button-go-premium">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Card>
          ) : visibleUsers.length === 0 ? (
            <Card className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold">No More Profiles</h3>
                <p className="text-muted-foreground">
                  We've shown you everyone in your area. Check back later for new profiles!
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.reload()}
                data-testid="button-refresh"
              >
                Refresh
              </Button>
            </Card>
          ) : (
            <div className="relative h-[600px]">
              {visibleUsers.slice(0, 3).reverse().map((user, index) => {
                const isTopCard = index === visibleUsers.slice(0, 3).length - 1;
                const zIndex = visibleUsers.slice(0, 3).length - index;
                const scale = 1 - (index * 0.05);
                const translateY = index * 8;
                const opacity = 1 - (index * 0.3);

                return (
                  <SwipeCard
                    key={user.id}
                    user={user}
                    onSwipe={handleSwipe}
                    isTopCard={isTopCard}
                    style={{
                      zIndex,
                      transform: `scale(${scale}) translateY(${translateY}px)`,
                      opacity,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
