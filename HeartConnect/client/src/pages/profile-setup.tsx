import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Heart, MapPin, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertProfile } from "@shared/schema";

const INTERESTS_OPTIONS = [
  "Travel", "Music", "Movies", "Sports", "Fitness", "Cooking",
  "Reading", "Art", "Photography", "Gaming", "Dancing", "Hiking",
  "Yoga", "Coffee", "Wine", "Fashion", "Technology", "Pets",
];

const profileSchema = z.object({
  age: z.number().min(18).max(100),
  gender: z.string().min(1, "Please select your gender"),
  location: z.string().min(1, "Location is required"),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  photos: z.array(z.string()).min(1, "Add at least one photo").max(9),
  lookingFor: z.string().optional(),
  ageRangeMin: z.number().min(18).max(100),
  ageRangeMax: z.number().min(18).max(100),
  maxDistance: z.number().min(1).max(500),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: 25,
      gender: "",
      location: "",
      bio: "",
      interests: [],
      photos: [],
      lookingFor: "",
      ageRangeMin: 18,
      ageRangeMax: 35,
      maxDistance: 50,
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertProfile>) => {
      return await apiRequest("POST", "/api/profiles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      toast({
        title: "Profile Created!",
        description: "Your profile is ready. Let's find your match!",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (photoUrls.length >= 9) {
        toast({
          title: "Maximum photos reached",
          description: "You can upload up to 9 photos",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPhotoUrls((prev) => [...prev, dataUrl]);
        form.setValue("photos", [...photoUrls, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(newPhotos);
    form.setValue("photos", newPhotos);
  };

  const toggleInterest = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest];
    
    setSelectedInterests(newInterests);
    form.setValue("interests", newInterests);
  };

  const onSubmit = (data: ProfileFormData) => {
    createProfileMutation.mutate(data);
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">Create Your Profile</h1>
          </div>
          <p className="text-muted-foreground">Step {step} of {totalSteps}</p>
          <Progress value={progress} className="mt-4" data-testid="progress-profile-setup" />
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="p-6 md:p-8 space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6" data-testid="step-basic-info">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl font-semibold">Basic Information</h2>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      {...form.register("age", { valueAsNumber: true })}
                      data-testid="input-age"
                    />
                    {form.formState.errors.age && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.age.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select onValueChange={(value) => form.setValue("gender", value)}>
                      <SelectTrigger id="gender" data-testid="select-gender">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.gender && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.gender.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g., New York, NY"
                        className="pl-10"
                        {...form.register("location")}
                        data-testid="input-location"
                      />
                    </div>
                    {form.formState.errors.location && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.location.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Photos */}
            {step === 2 && (
              <div className="space-y-6" data-testid="step-photos">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl font-semibold">Add Your Photos</h2>
                </div>

                <p className="text-sm text-muted-foreground">
                  Add at least one photo (up to 9). Your first photo will be your main profile picture.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-remove-photo-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium">
                          Main
                        </div>
                      )}
                    </div>
                  ))}

                  {photoUrls.length < 9 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-border hover-elevate cursor-pointer flex flex-col items-center justify-center gap-2 p-4 text-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        multiple
                        data-testid="input-photo-upload"
                      />
                    </label>
                  )}
                </div>
                {form.formState.errors.photos && (
                  <p className="text-sm text-destructive">{form.formState.errors.photos.message}</p>
                )}
              </div>
            )}

            {/* Step 3: About & Interests */}
            {step === 3 && (
              <div className="space-y-6" data-testid="step-about">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl font-semibold">About You</h2>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    className="h-32 resize-none"
                    {...form.register("bio")}
                    data-testid="textarea-bio"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.watch("bio")?.length || 0}/500 characters
                  </p>
                </div>

                <div>
                  <Label>Interests * (Select at least one)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {INTERESTS_OPTIONS.map((interest) => (
                      <Badge
                        key={interest}
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer hover-elevate"
                        onClick={() => toggleInterest(interest)}
                        data-testid={`badge-interest-${interest.toLowerCase()}`}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.interests && (
                    <p className="text-sm text-destructive mt-2">{form.formState.errors.interests.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <div className="space-y-6" data-testid="step-preferences">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl font-semibold">Your Preferences</h2>
                </div>

                <div>
                  <Label htmlFor="lookingFor">Looking For</Label>
                  <Select onValueChange={(value) => form.setValue("lookingFor", value)}>
                    <SelectTrigger id="lookingFor" data-testid="select-looking-for">
                      <SelectValue placeholder="Select what you're looking for" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Men</SelectItem>
                      <SelectItem value="female">Women</SelectItem>
                      <SelectItem value="everyone">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Age Range: {form.watch("ageRangeMin")} - {form.watch("ageRangeMax")}</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="ageRangeMin" className="text-xs">Min Age</Label>
                      <Input
                        id="ageRangeMin"
                        type="number"
                        {...form.register("ageRangeMin", { valueAsNumber: true })}
                        data-testid="input-age-min"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ageRangeMax" className="text-xs">Max Age</Label>
                      <Input
                        id="ageRangeMax"
                        type="number"
                        {...form.register("ageRangeMax", { valueAsNumber: true })}
                        data-testid="input-age-max"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxDistance">Maximum Distance: {form.watch("maxDistance")} km</Label>
                  <Input
                    id="maxDistance"
                    type="range"
                    min="1"
                    max="500"
                    {...form.register("maxDistance", { valueAsNumber: true })}
                    className="mt-2"
                    data-testid="slider-max-distance"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-border">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}
              
              <div className={step === 1 ? "ml-auto" : ""}>
                {step < totalSteps ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createProfileMutation.isPending}
                    data-testid="button-complete-profile"
                  >
                    {createProfileMutation.isPending ? "Creating..." : "Complete Profile"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
