# Spark - Dating App

A modern, mobile-responsive dating application built with React, Express, and PostgreSQL. Features smart matchmaking, real-time chat, and a beautiful swipe interface.

## Overview

Spark is a full-featured dating app that helps people make meaningful connections. The app includes user authentication via Replit Auth, profile creation with photos and interests, a Tinder-style swipe interface, smart matching based on preferences, and real-time messaging.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Wouter** for routing
- **TanStack Query** for data fetching and caching
- **Shadcn/UI** component library
- **Tailwind CSS** for styling
- **Framer Motion** for animations (design guidelines suggest smooth swipe animations)
- **WebSocket** for real-time chat

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** (Neon) database
- **Drizzle ORM** for database operations
- **Replit Auth** (OpenID Connect) for authentication
- **WebSocket** server for real-time messaging
- **Passport.js** for session management

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── SwipeCard.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── ui/         # Shadcn components
│   │   ├── pages/          # Page components
│   │   │   ├── landing.tsx
│   │   │   ├── profile-setup.tsx
│   │   │   ├── discover.tsx
│   │   │   ├── matches.tsx
│   │   │   ├── chat.tsx
│   │   │   ├── profile.tsx
│   │   │   └── settings.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useAuth.ts
│   │   ├── lib/            # Utilities
│   │   └── index.css       # Global styles
│   └── index.html
├── server/
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── db.ts               # Database connection
│   ├── replitAuth.ts       # Authentication setup
│   └── index.ts            # Server entry point
├── shared/
│   └── schema.ts           # Shared database schemas and types
├── design_guidelines.md    # UI/UX design specifications
└── replit.md              # This file
```

## Key Features

### 1. User Authentication
- Replit Auth integration (Google, GitHub, Apple, email/password)
- Secure session management with PostgreSQL session store
- Protected routes and API endpoints

### 2. Profile Management
- Multi-step profile setup wizard
- Photo upload (1-9 photos)
- Bio and interests selection
- Preference settings (age range, distance, looking for)
- Profile editing

### 3. Discovery & Matching
- Swipe interface with card stack animation
- Smart matchmaking based on:
  - Location proximity
  - Age preferences
  - Gender preferences
  - Shared interests
- Daily swipe limits (10 for free users)
- Super like feature

### 4. Matches & Messaging
- Match list with user details
- Real-time chat with WebSocket
- Message history
- Typing indicators (in design guidelines)
- Emoji support

### 5. Safety & Privacy
- User reporting system
- Block functionality
- Profile visibility settings
- Content moderation (planned)

### 6. Premium Features
- Unlimited swipes
- Super likes
- See who liked you
- Priority in matches
- Incognito mode

## Database Schema

### Core Tables
- `users` - User accounts (from Replit Auth)
- `profiles` - Extended user information
- `swipes` - Swipe actions (like/pass)
- `matches` - Mutual likes
- `messages` - Chat messages
- `reports` - User reports
- `blocks` - Blocked users
- `daily_swipes` - Daily swipe tracking
- `sessions` - Session storage

## API Endpoints

### Authentication
- `GET /api/login` - Start login flow
- `GET /api/logout` - Logout
- `GET /api/callback` - OAuth callback
- `GET /api/auth/user` - Get current user

### Profiles
- `GET /api/profiles/me` - Get own profile
- `POST /api/profiles` - Create/update profile
- `GET /api/profiles/:id` - Get user profile

### Discovery
- `GET /api/discover` - Get potential matches
- `GET /api/swipes/daily` - Get daily swipe count

### Swipes & Matches
- `POST /api/swipes` - Record swipe action
- `GET /api/matches` - Get user's matches
- `GET /api/matches/:id` - Get specific match

### Messaging
- `GET /api/messages/:matchId` - Get messages for a match
- `POST /api/matches/:matchId/messages` - Send message
- `WS /ws` - WebSocket connection for real-time chat

### Safety
- `POST /api/reports` - Report user
- `POST /api/blocks` - Block user

## Design System

The app follows a modern, mobile-first design approach with:

### Colors
- **Primary**: Vibrant coral-pink (#E63956) - represents passion and energy
- **Secondary**: Soft purple - sophistication
- **Accent**: Used sparingly for premium features
- **Success**: Celebration green for matches

### Typography
- **Display Font**: Outfit (headlines, CTAs)
- **Body Font**: Inter (UI, body text)

### Key Design Principles
1. Mobile-first responsive design
2. Touch-friendly interactions
3. Smooth animations and transitions
4. Card-based UI with generous whitespace
5. Gradient backgrounds for visual interest
6. Clear visual hierarchy
7. Emoji-free professional aesthetic

See `design_guidelines.md` for complete design specifications.

## Development Workflow

### Setup
1. Install dependencies: `npm install`
2. Database is auto-provisioned via Replit
3. Environment variables are managed automatically

### Running
- Start dev server: `npm run dev`
- Database migrations: `npm run db:push`
- Type checking: `npx tsc --noEmit`

### Code Style
- TypeScript for type safety
- Functional React components with hooks
- Controlled forms with react-hook-form + Zod validation
- TanStack Query for all API calls
- Consistent use of Shadcn components

## Recent Changes

### Latest Updates
- ✅ Complete database schema with relations
- ✅ All frontend pages and components built
- ✅ Design system configured (colors, fonts, spacing)
- ✅ Routing and authentication flow
- ✅ Mobile-responsive layouts
- ✅ Bottom navigation
- 🔄 Backend API implementation (in progress)
- 🔄 WebSocket integration (in progress)
- 🔄 Real data integration (in progress)

## User Preferences
- Mobile-first design approach
- Modern dating app aesthetics
- Real-time communication
- Safety and privacy focused
- Free tier with premium upgrade path

## Next Steps
1. Implement backend API endpoints
2. Set up WebSocket server for real-time chat
3. Integrate frontend with backend
4. Add loading and error states
5. Test all user journeys
6. Polish animations and transitions
