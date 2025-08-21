# Overview

This is a full-stack web application called "AdEarn Bot" - a mobile-first earning platform where users can watch advertisements to earn cryptocurrency. The application allows users to register with referral codes, complete daily missions, watch ads for earnings, and manage their cryptocurrency wallet with withdrawal capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Header UI Simplified (Aug 21, 2025)
- Removed "Lightning Sats" title and coin icon from header
- Removed level display from header top-right
- Changed to simple centered text: "Watch to Earn - Tester Men"
- User requested: "title aur level remove karo bas watch to earn likha hona chahiye"

## Level System Requirements Updated (Aug 21, 2025)
- Updated Level 2 requirement from 100 ads to 10,000 ads watched
- Updated Level 3 requirement from 200 ads to 50,000 ads watched  
- Updated withdrawal requirements from 1,000 ads to 10,000 ads
- Updated "Reach Level 2" mission target from 100 to 10,000 ads
- Added progress bars showing current ads progress towards next level
- Added $0.25 bonus reward for reaching Level 2 (10,000 ads)
- Added $0.50 bonus reward for reaching Level 3 (50,000 ads)
- Level up bonuses are added directly to withdraw balance
- User requested: "Level 2 pochne ke liye 10,000 ads dekhna padega"
- User requested: "10000 ads dekhne ke baad 0.25$ milega"

## Telegram Bot Start Command Updated (Aug 21, 2025)
- Updated Telegram start message with better formatting and HTML
- Added admin detection (userId === 6653616672)
- Added dynamic referral link generation
- Added available commands list (/referlink, /withdraw, /help, /adminpanel for admin)
- Added disable_web_page_preview for cleaner message display
- Admin users get special /adminpanel command in their welcome message

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation and card-based layout

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for user management, ad sessions, and missions
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Session Management**: Express session handling with PostgreSQL session store support

## Data Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema**: Shared TypeScript schemas between client and server using Zod for validation
- **Database Tables**: Users, ad sessions, missions, and user missions with proper relationships
- **Migrations**: Drizzle Kit for database schema migrations

## Component Architecture
- **Layout Components**: Header with user level display and bottom navigation with 4 main sections (More section removed)
- **Page Components**: Home (ad watching), Friends (referrals), Missions (daily tasks), Wallet (earnings)
- **Telegram Integration**: Telegram Web App script integration and bot API communication
- **Ad Integration**: show_9368336() function integration for three ad types with proper reward flow
- **UI Components**: Comprehensive set of reusable components from Shadcn/ui including forms, dialogs, toasts, and data display components
- **Custom Components**: Toast notifications and loading overlays for enhanced UX

## Key Features
- **User Registration**: Username-based registration with unique referral code generation
- **Telegram Integration**: Full Telegram Web App support with bot API integration (@LightningSatsbot)
- **Ad Watching System**: Three types of ads using show_9368336() function:
  - Rewarded interstitial (manual ad watching)
  - Rewarded popup (claim rewards after completing daily ads)
  - In-App interstitial (automatic ads with frequency settings)
- **Referral System**: Telegram-based referral links with 10% earning share
- **Mission System**: Daily check-ins, ad watching goals, referral targets, and level progression
- **Wallet Management**: USD BSC and Payeer wallet withdrawal support with Telegram notifications
- **Progress Tracking**: User levels, streaks, and mission completion tracking

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **Build Tools**: Vite with TypeScript support and development plugins
- **Database**: Neon Database serverless PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI primitives for accessible component foundation

## Telegram Integration
- **Telegram Web App**: Official Telegram Web App script integration
- **Bot API**: @LightningSatsbot (Token: 7561099955:AAF3Pc-C1-dhLiGqS_hwnegI5a9_55evHcQ)
- **User Management**: Telegram user ID-based referral system
- **Notifications**: Withdrawal request notifications sent to admin via bot

## Ad Network Integration
- **Ad Function**: show_9368336() function for three ad types
- **Ad Types**: Rewarded interstitial, Rewarded popup, In-App interstitial
- **Reward System**: Automatic user rewards after successful ad completion

## Styling and Design
- **CSS Framework**: Tailwind CSS with custom design system
- **Icons**: Font Awesome for comprehensive icon library
- **Fonts**: Google Fonts integration for typography
- **Theme**: Custom dark theme with CSS variables

## Development Tools
- **Type Safety**: TypeScript with strict configuration
- **Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for date manipulation
- **State Management**: TanStack Query for server state

## Payment Methods
- **USD BSC**: Binance Smart Chain USD withdrawals
- **Payeer Wallet**: Payeer wallet integration for withdrawals
- **Telegram Notifications**: Admin notifications for withdrawal requests