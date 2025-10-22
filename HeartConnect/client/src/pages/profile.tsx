import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MapPin, Edit } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@shared/schema";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles/me"],
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Edit className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold">Complete Your Profile</h3>
            <p className="text-muted-foreground">
              Let's set up your profile so you can start meeting amazing people!
            </p>
          </div>
          <Button
            onClick={() => setLocation("/profile-setup")}
            className="w-full"
            data-testid="button-setup-profile"
          >
            Set Up Profile
          </Button>
        </Card>
      </div>
    );
  }

  const photos = profile.photos || [];
  const interests = profile.interests || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">My Profile</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/settings")}
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Photo Gallery */}
        <Card className="overflow-hidden">
          <div className="grid grid-cols-3 gap-1">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square overflow-hidden relative"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold" data-testid="text-profile-name">
                {user?.firstName}, {profile.age}
              </h2>
              {profile.location && (
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/profile-setup")}
              data-testid="button-edit"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {profile.bio && (
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}
        </Card>

        {/* Interests */}
        {interests.length > 0 && (
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, idx) => (
                <Badge key={idx} variant="secondary" data-testid={`badge-interest-${idx}`}>
                  {interest}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Preferences */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Looking For</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender</span>
              <span className="font-medium capitalize">{profile.lookingFor || 'Everyone'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age Range</span>
              <span className="font-medium">
                {profile.ageRangeMin} - {profile.ageRangeMax}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Distance</span>
              <span className="font-medium">{profile.maxDistance} km</span>
            </div>
          </div>
        </Card>

        {/* Premium Status */}
        <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {profile.isPremium ? 'Premium Member' : 'Free Plan'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.isPremium
                  ? 'Enjoy unlimited swipes and exclusive features'
                  : 'Upgrade to unlock unlimited swipes'}
              </p>
            </div>
            {profile.isPremium ? (
              <Badge className="bg-gradient-to-r from-primary to-accent">Premium</Badge>
            ) : (
              <Button size="sm" data-testid="button-upgrade-profile">
                Upgrade
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
