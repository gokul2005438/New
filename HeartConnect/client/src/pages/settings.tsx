import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Shield, Bell, User, CreditCard, Sparkles, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-xl font-bold">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Account Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Account</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-edit-profile">
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Premium Section */}
        <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Premium Features</h2>
            <Badge variant="outline" className="ml-auto">Free Plan</Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Upgrade to Premium for unlimited swipes, super likes, and exclusive features.
          </p>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Unlimited swipes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>5 super likes per day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>See who liked you</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Priority in matches</span>
            </div>
          </div>

          <Button className="w-full" data-testid="button-upgrade">
            <CreditCard className="w-4 h-4 mr-2" />
            Upgrade to Premium - $19.99/month
          </Button>
        </Card>

        {/* Notifications */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Matches</p>
                <p className="text-xs text-muted-foreground">Get notified when you match with someone</p>
              </div>
              <Switch defaultChecked data-testid="switch-match-notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Messages</p>
                <p className="text-xs text-muted-foreground">Get notified when you receive a message</p>
              </div>
              <Switch defaultChecked data-testid="switch-message-notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Super Likes</p>
                <p className="text-xs text-muted-foreground">Get notified when someone super likes you</p>
              </div>
              <Switch defaultChecked data-testid="switch-superlike-notifications" />
            </div>
          </div>
        </Card>

        {/* Safety & Privacy */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Safety & Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Incognito Mode</p>
                <p className="text-xs text-muted-foreground">Only people you like can see your profile</p>
              </div>
              <Badge variant="secondary">Premium</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Distance</p>
                <p className="text-xs text-muted-foreground">Display your distance from other users</p>
              </div>
              <Switch defaultChecked data-testid="switch-show-distance" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Age</p>
                <p className="text-xs text-muted-foreground">Display your age on your profile</p>
              </div>
              <Switch defaultChecked data-testid="switch-show-age" />
            </div>

            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" data-testid="button-report-user">
                  <Shield className="w-4 h-4 mr-2" />
                  Report a User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report a User</DialogTitle>
                  <DialogDescription>
                    Help us keep the community safe by reporting inappropriate behavior.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Reason *</Label>
                    <RadioGroup value={reportReason} onValueChange={setReportReason} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inappropriate" id="inappropriate" />
                        <Label htmlFor="inappropriate" className="font-normal">
                          Inappropriate Content
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="scam" id="scam" />
                        <Label htmlFor="scam" className="font-normal">
                          Scam or Fraud
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fake" id="fake" />
                        <Label htmlFor="fake" className="font-normal">
                          Fake Profile
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="harassment" id="harassment" />
                        <Label htmlFor="harassment" className="font-normal">
                          Harassment
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="font-normal">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="details">Additional Details</Label>
                    <Textarea
                      id="details"
                      placeholder="Tell us more about the issue..."
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      className="mt-2 h-24"
                      data-testid="textarea-report-details"
                    />
                  </div>

                  <Button
                    className="w-full"
                    disabled={!reportReason}
                    onClick={() => {
                      toast({
                        title: "Report Submitted",
                        description: "Thank you for helping us keep the community safe.",
                      });
                      setReportDialogOpen(false);
                      setReportReason("");
                      setReportDetails("");
                    }}
                    data-testid="button-submit-report"
                  >
                    Submit Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6">
          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground space-y-2 pt-4">
          <p>Spark v1.0.0</p>
          <div className="flex justify-center gap-4">
            <button className="hover:text-foreground transition-colors">Privacy Policy</button>
            <button className="hover:text-foreground transition-colors">Terms of Service</button>
            <button className="hover:text-foreground transition-colors">Help & Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}
