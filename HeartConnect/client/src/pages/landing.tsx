import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Shield, Sparkles, Zap, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo / Brand */}
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" data-testid="icon-logo" />
              </div>
              <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Spark
              </h1>
            </div>

            {/* Hero Headline */}
            <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight" data-testid="text-hero-title">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Match
              </span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Connect with people who share your interests and values. 
              Smart matching, real conversations, genuine connections.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 min-h-14"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-get-started"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 min-h-14 backdrop-blur-sm"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap gap-8 justify-center items-center pt-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">50,000+ Matches Made</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 md:py-24 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-features-title">
              Why Choose Spark?
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card border border-card-border rounded-xl p-6 space-y-4 hover-elevate" data-testid="card-feature-matching">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-display text-xl font-semibold">Smart Matching</h4>
                <p className="text-muted-foreground">
                  Our algorithm finds compatible matches based on your interests, location, and preferences.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card border border-card-border rounded-xl p-6 space-y-4 hover-elevate" data-testid="card-feature-messaging">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-display text-xl font-semibold">Real-Time Chat</h4>
                <p className="text-muted-foreground">
                  Connect instantly with your matches through our real-time messaging system.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card border border-card-border rounded-xl p-6 space-y-4 hover-elevate" data-testid="card-feature-safety">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-destructive" />
                </div>
                <h4 className="font-display text-xl font-semibold">Safe & Secure</h4>
                <p className="text-muted-foreground">
                  Your safety is our priority with photo verification and comprehensive reporting tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-how-it-works-title">
              How It Works
            </h3>

            <div className="space-y-8">
              {[
                { step: 1, title: "Create Your Profile", desc: "Add photos and tell us about yourself in minutes" },
                { step: 2, title: "Swipe & Match", desc: "Browse profiles and swipe right on people you like" },
                { step: 3, title: "Start Chatting", desc: "When you both swipe right, start a conversation" },
                { step: 4, title: "Meet Someone Amazing", desc: "Take it from there and see where it goes" },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start" data-testid={`step-${item.step}`}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-semibold mb-2">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Section */}
      <div className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Features</span>
            </div>

            <h3 className="font-display text-3xl md:text-4xl font-bold" data-testid="text-premium-title">
              Unlock Unlimited Potential
            </h3>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Free users get 10 swipes per day. Go premium for unlimited swipes, 
              super likes, and priority visibility.
            </p>

            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 min-h-14 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-go-premium"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explore Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 md:py-24 bg-card border-t border-card-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="font-display text-3xl md:text-4xl font-bold" data-testid="text-cta-title">
              Ready to Find Your Match?
            </h3>
            <p className="text-xl text-muted-foreground">
              Join thousands of singles making meaningful connections.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 min-h-14"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-join-now"
            >
              <Heart className="w-5 h-5 mr-2" />
              Join Now - It's Free
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Spark. Made with <Heart className="w-4 h-4 inline text-primary" /> for meaningful connections.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
