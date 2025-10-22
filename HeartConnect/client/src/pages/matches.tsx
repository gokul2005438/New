import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import type { MatchWithUsers } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function Matches() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: matches = [], isLoading } = useQuery<MatchWithUsers[]>({
    queryKey: ["/api/matches"],
  });

  const getOtherUser = (match: MatchWithUsers) => {
    return match.user1Id === user?.id ? match.user2 : match.user1;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="font-display text-xl font-bold">Matches</h1>
            <Badge variant="secondary" className="ml-auto" data-testid="badge-match-count">
              {matches.length}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {matches.length === 0 ? (
          <Card className="p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold">No Matches Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start swiping to find your perfect match! When you both like each other, you'll see them here.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => {
              const otherUser = getOtherUser(match);
              const profile = otherUser.profile;

              if (!profile) return null;

              return (
                <Card
                  key={match.id}
                  className="p-4 hover-elevate cursor-pointer transition-all"
                  onClick={() => setLocation(`/chat/${match.id}`)}
                  data-testid={`match-card-${match.id}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Profile Photo */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                        <img
                          src={profile.photos?.[0] || "/placeholder-avatar.png"}
                          alt={`${otherUser.firstName}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Online indicator - mock */}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg" data-testid={`text-match-name-${match.id}`}>
                        {otherUser.firstName}, {profile.age}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        Matched {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
