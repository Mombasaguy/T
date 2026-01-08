# Talent Pilot

## Overview

A candidate tracking and hiring pipeline management dashboard built with React and Express. The application enables recruiters to manage job candidates through various hiring stages (applied, screening, interview, offer, hired, rejected) with a Kanban-style pipeline view, candidate cards, and dashboard analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state and data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful JSON API under `/api/*` routes
- **Storage**: In-memory storage implementation with interface for database abstraction
- **Database Schema**: Drizzle ORM with PostgreSQL dialect (schema defined, uses MemStorage currently)

### Key Design Patterns
- **Shared Schema**: Types and validation schemas in `shared/schema.ts` using Drizzle and Zod
- **Storage Interface**: `IStorage` interface allows swapping between memory and database implementations
- **Query Client**: Centralized API request handling with auth-aware error handling

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    pages/        # Route page components
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data storage layer
shared/           # Shared types and schemas
  schema.ts       # Drizzle schema and Zod validation
```

### Pages and Features
- **Dashboard**: Overview stats, recent candidates, upcoming interviews
- **Candidates**: CRUD operations with grid/list views, filtering, search
- **Pipeline**: Kanban board with drag-and-drop stage management
- **Search**: External candidate search using Exa API integration
- **Pricing**: Subscription tiers (Free, Professional $99/mo, Team $299/mo)
- **Welcome**: Post-checkout success page with onboarding steps
- **Stats**: Search analytics and usage tracking

### Billing & Subscriptions
- **Stripe Integration**: Uses stripe-replit-sync for managed webhooks and data sync
- **Subscription Plans**: Free (10 searches), Professional (200 searches), Team (1000 searches)
- **Database Tables**: `subscriptions` table tracks user plan, usage, and Stripe references

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database toolkit for schema definition and queries
- **connect-pg-simple**: Session storage for Express

### External APIs
- **Exa API**: Web search integration for candidate sourcing (`exa-js` package)

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-styled component system using Radix + Tailwind
- **Lucide React**: Icon library

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `react-hook-form` + `@hookform/resolvers`: Form handling with Zod validation
- `date-fns`: Date formatting utilities
- `class-variance-authority`: Component variant management
- `wouter`: Client-side routing