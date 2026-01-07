# CryptoBot - Telegram Cryptocurrency Price Bot

## Overview

CryptoBot is a Telegram bot application that sends automated cryptocurrency price updates to users. The project consists of a full-stack web application with a landing page for monitoring bot status, plus standalone Firebase Functions code for deployment. Users interact with the bot via Telegram commands to configure their price alert preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for landing page animations
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with hot module replacement

The frontend is a single-page application serving a landing page that displays bot statistics and system status. Components are organized with shadcn/ui patterns using Radix UI primitives.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: REST endpoints defined in `shared/routes.ts` with Zod validation
- **Bot Integration**: node-telegram-bot-api for Telegram webhook handling

The server handles three main endpoints:
1. `/api/webhook` - Receives Telegram updates
2. `/api/stats` - Returns active user count for dashboard
3. `/api/scheduler/trigger` - Manual scheduler trigger for testing

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Connection**: pg (node-postgres) pool via DATABASE_URL environment variable
- **Migrations**: Drizzle Kit with `db:push` command

The database stores user configurations including Telegram user ID, channel ID, preferred coin symbol, update interval, and active status.

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    hooks/        # Custom React hooks
    pages/        # Page components
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod schemas
firebase_output/  # Standalone Firebase deployment code
```

### Build System
- Development: `tsx server/index.ts` with Vite dev server middleware
- Production: esbuild bundles server, Vite builds client to `dist/`
- Server dependencies are selectively bundled to reduce cold start times

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Third-Party APIs
- **Telegram Bot API**: Bot interactions via webhook mode (requires TELEGRAM_BOT_TOKEN)
- **CoinGecko API**: Cryptocurrency price data fetching (used in Firebase functions)

### Firebase (Alternative Deployment)
The `firebase_output/` directory contains standalone Firebase Functions code for users who want to deploy the bot on Firebase instead of the main server. This includes:
- Cloud Functions for webhook handling
- Pub/Sub scheduled functions for price updates
- Firestore rules for data storage

### UI Libraries
- shadcn/ui components (Radix UI primitives)
- Lucide React icons
- Framer Motion animations