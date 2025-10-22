# Dating App Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from leading dating platforms (Tinder, Bumble, Hinge) with a modern, youthful twist. The design emphasizes emotional connection, visual appeal, and effortless interaction—creating an experience that feels exciting yet trustworthy.

**Core Principles**:
- Mobile-first, thumb-friendly interactions
- Visual hierarchy that prioritizes photos and key profile details
- Warm, inviting aesthetics that reduce anxiety
- Clear distinction between free and premium experiences
- Safety and trust indicators throughout

## Color Palette

**Light Mode**:
- Primary Brand: 340 82% 57% (vibrant coral-pink, passion and energy)
- Primary Hover: 340 82% 52%
- Secondary: 280 65% 60% (soft purple, sophistication)
- Background: 0 0% 98%
- Card Background: 0 0% 100%
- Text Primary: 220 18% 20%
- Text Secondary: 220 12% 45%
- Border: 220 13% 91%
- Success (Match): 142 76% 45% (celebration green)
- Destructive (Pass): 0 0% 60%

**Dark Mode**:
- Primary Brand: 340 82% 62%
- Primary Hover: 340 82% 67%
- Secondary: 280 60% 65%
- Background: 220 18% 12%
- Card Background: 220 15% 16%
- Text Primary: 0 0% 98%
- Text Secondary: 220 10% 65%
- Border: 220 13% 22%

**Accent Colors** (use sparingly):
- Highlight: 45 100% 51% (gold for premium features only)
- Info: 200 95% 55% (fresh blue for notifications)

## Typography

**Font Families**:
- Primary: 'Inter' (profiles, UI, body text)
- Display: 'Outfit' (headlines, CTAs, emphasis)

**Scale**:
- Display Large: 2.5rem/3rem, 700 weight (landing hero)
- Display: 2rem/2.5rem, 700 weight (section headers)
- H1: 1.75rem/2rem, 600 weight (profile names)
- H2: 1.5rem/2rem, 600 weight (chat headers)
- H3: 1.25rem/1.75rem, 500 weight (subsections)
- Body: 1rem/1.5rem, 400 weight (bios, descriptions)
- Small: 0.875rem/1.25rem, 400 weight (metadata, timestamps)
- Caption: 0.75rem/1rem, 500 weight (labels, badges)

## Layout System

**Spacing Units**: Use Tailwind units of 1, 2, 3, 4, 6, 8, 12, 16
- Component padding: p-4 (mobile), p-6 (desktop)
- Card spacing: gap-4
- Section spacing: py-8 (mobile), py-12 (desktop)
- Element spacing: space-y-2 for tight groups, space-y-4 for sections

**Breakpoints**:
- Mobile: default (< 640px)
- Tablet: md (768px+)
- Desktop: lg (1024px+)

**Container Widths**:
- Swipe cards: max-w-sm centered
- Chat interface: max-w-2xl
- Profile view: max-w-4xl
- Landing sections: max-w-6xl

## Component Library

### A. Navigation
**Mobile Bottom Tab Bar** (primary navigation):
- Fixed bottom position with backdrop blur
- 5 icons: Discover, Matches, Messages, Profile, Settings
- Active state: primary color with scale animation
- Height: h-16 with safe-area-inset-bottom

**Top App Bar**:
- Sticky position with logo/title centered
- Action buttons (filters, premium badge) on right
- Glass morphism effect (bg-opacity-90, backdrop-blur)

### B. Swipe Cards
**Profile Card**:
- Aspect ratio: 4:5 (portrait)
- Rounded corners: rounded-3xl
- Shadow: shadow-2xl with subtle lift on interaction
- Image overlay gradient: from-transparent to-black/60 at bottom
- Content zone: bottom 40% with name, age, distance, quick bio
- Like/Pass buttons: Floating circular buttons (56px) with icon-only, positioned bottom corners
- Super Like: Star icon button, centered bottom with special animation

**Card Stack**:
- Show 3 cards in stack with scale/opacity progression
- Top card: scale-100, opacity-100
- Second: scale-95, opacity-60, translate-y-2
- Third: scale-90, opacity-30, translate-y-4

### C. Profile View (Expanded)
**Full Profile Layout**:
- Hero image carousel with dots indicator
- Sticky header with back button and report/block menu
- Sections: About, Interests (pill badges), Basics (grid), Prompts (Q&A cards)
- Floating CTA: Like/Pass buttons remain accessible while scrolling

**Interest Pills**:
- Rounded-full, bg-secondary/10, text-secondary
- Padding: px-4 py-2
- Flex wrap with gap-2

### D. Matches & Messaging
**Match List**:
- Card per match with circular avatar (64px), name, preview text
- Unread indicator: small dot, primary color
- Timestamp: top-right, text-sm, text-secondary
- Hover/active: subtle scale and background change

**Chat Interface**:
- Message bubbles: max-w-[75%]
- Sent messages: bg-primary, text-white, rounded-l-2xl rounded-tr-2xl, ml-auto
- Received: bg-card-background, border, rounded-r-2xl rounded-tl-2xl
- Timestamps: text-xs, text-secondary, grouped by time
- Input: sticky bottom with rounded-full container, emoji picker, send button

**Match Celebration Modal**:
- Full-screen overlay with confetti animation
- Large "It's a Match!" text (Display weight)
- Both profile photos side-by-side
- "Say Hi" primary button and "Keep Swiping" secondary

### E. Premium Features
**Subscription Cards**:
- 3-tier layout: Free, Plus, Premium
- Highlight Premium with border-2 border-primary and "Most Popular" badge
- Feature checklist with icons
- Pricing: Display size with /month caption
- Gradient background for premium tiers

**Premium Indicators**:
- Gold badge next to username
- Unlock icons on gated features
- Subtle shimmer animation on premium CTAs

### F. Forms & Inputs
**Profile Creation**:
- Multi-step wizard with progress bar (4-6 steps)
- Large photo upload zones with drag-and-drop (aspect-ratio-square, dashed border)
- Interest selector: grid of checkable cards with icons
- Range sliders for preferences (age, distance) with visible values
- Toggle switches for privacy settings

**Input Fields**:
- Rounded-xl borders
- Focus: border-primary, ring-2 ring-primary/20
- Labels: text-sm, font-medium, mb-2
- Helper text: text-xs, text-secondary

### G. Safety & Trust Elements
**Verification Badge**:
- Blue checkmark icon next to name
- Tooltip: "Photo verified"

**Report/Block UI**:
- Bottom sheet modal with radio options
- Categories: Inappropriate, Scam, Fake Profile, Other
- Text area for details
- Prominent "Submit Report" button

## Images

**Hero Section** (Landing Page):
- Large hero image showing diverse, happy couples/individuals in authentic dating scenarios
- Aspect ratio: 16:9 on desktop, full-height on mobile
- Overlay: gradient from-transparent via-black/30 to-black/60
- Position: Background with centered content overlay

**Profile Photos**:
- Minimum 3, maximum 9 photos per profile
- First photo: primary, shown in swipe deck
- Aspect ratio: flexible but cropped to 4:5 for cards
- Compression: optimized for mobile, lazy-loaded

**Feature Showcases** (Landing):
- Screenshots of swipe interface, match screen, chat UI
- Shown in iPhone/mobile frames with subtle shadows
- Positioned in 2-column grid (desktop), stacked (mobile)

**Background Elements**:
- Subtle gradient meshes in brand colors for section backgrounds
- Abstract shapes/blobs in secondary color at 5% opacity for visual interest

## Animations

**Swipe Gestures**:
- Card rotation: -15deg (left), +15deg (right) based on drag
- Transform: translateX based on swipe distance
- Transition: spring physics (tension: 300, friction: 30)
- Exit animation: slide off screen with fade

**Match Celebration**:
- Confetti particles (60-80 pieces) with random trajectories
- Profile photos zoom in with bounce effect
- Modal slides up from bottom with fade-in

**Micro-interactions**:
- Button press: scale-95 on active
- Like button: heart grows with bounce when pressed
- New message: subtle pulse on chat icon badge
- Loading states: skeleton screens with shimmer effect

---

**Overall Aesthetic**: Playful yet premium, prioritizing imagery and emotional connection while maintaining clarity and ease of use. The design should feel contemporary, trustworthy, and optimized for one-handed mobile use.