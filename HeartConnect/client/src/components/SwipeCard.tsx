import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, Star } from "lucide-react";
import type { UserWithProfile } from "@shared/schema";

interface SwipeCardProps {
  user: UserWithProfile;
  onSwipe: (userId: string, direction: 'like' | 'pass') => void;
  style?: React.CSSProperties;
  isTopCard?: boolean;
}

export function SwipeCard({ user, onSwipe, style, isTopCard = false }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const profile = user.profile;

  if (!profile) return null;

  const photos = profile.photos || [];
  const interests = profile.interests || [];

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const calculateDistance = () => {
    // Mock distance calculation - would use actual geolocation in production
    return Math.floor(Math.random() * 50) + 1;
  };

  return (
    <div
      className="absolute inset-0 w-full"
      style={style}
      data-testid={`swipe-card-${user.id}`}
    >
      <Card className="relative h-full rounded-3xl overflow-hidden border-none shadow-2xl">
        {/* Photo */}
        <div className="relative h-full">
          <img
            src={photos[currentPhotoIndex] || "/placeholder-avatar.png"}
            alt={`${user.firstName || 'User'}'s profile`}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

          {/* Photo Indicators */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Navigation Areas (invisible) */}
          {isTopCard && photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
                aria-label="Previous photo"
              />
              <button
                onClick={nextPhoto}
                className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
                aria-label="Next photo"
              />
            </>
          )}

          {/* Profile Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="space-y-3">
              <div>
                <h3 className="font-display text-3xl font-bold" data-testid={`text-name-${user.id}`}>
                  {user.firstName || 'User'}, {profile.age}
                </h3>
                {profile.location && (
                  <div className="flex items-center gap-1 text-sm mt-1" data-testid={`text-location-${user.id}`}>
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                    <span className="mx-1">•</span>
                    <span>{calculateDistance()} km away</span>
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm line-clamp-2" data-testid={`text-bio-${user.id}`}>
                  {profile.bio}
                </p>
              )}

              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interests.slice(0, 3).map((interest, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                      data-testid={`badge-interest-${idx}`}
                    >
                      {interest}
                    </Badge>
                  ))}
                  {interests.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                    >
                      +{interests.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isTopCard && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
            <Button
              size="icon"
              variant="outline"
              className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border-2 border-destructive/20 hover:bg-destructive hover:text-destructive-foreground shadow-lg"
              onClick={() => onSwipe(user.id, 'pass')}
              data-testid={`button-pass-${user.id}`}
            >
              <X className="w-7 h-7" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border-2 border-accent/20 hover:bg-accent hover:text-accent-foreground shadow-lg"
              data-testid={`button-superlike-${user.id}`}
            >
              <Star className="w-6 h-6" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border-2 border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg"
              onClick={() => onSwipe(user.id, 'like')}
              data-testid={`button-like-${user.id}`}
            >
              <Heart className="w-7 h-7" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
