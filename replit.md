# VoyagerLuxury - Luxury Travel Booking Platform

## Overview

VoyagerLuxury is a full-stack luxury travel booking platform that enables users to browse and book premium travel packages, hotels, car rentals, and last-minute deals. The system features an admin dashboard for content management, integrated payment processing via Stripe, user authentication, reviews, and a comprehensive booking system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theme variables for luxury branding
- **State Management**: React Context API for global state (Auth, Store)
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion for smooth transitions and interactions
- **Forms**: React Hook Form with Zod validation

**Key Design Decisions**:
- Context-based architecture separates authentication (AuthContext) from business data (StoreContext)
- Component composition using Radix UI primitives ensures accessibility
- Custom theme system with CSS variables enables light/dark mode and luxury color palette
- Client-side routing with dynamic slug-based URLs for SEO-friendly paths

### Backend Architecture

**Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20+
- **Build Tool**: esbuild for fast server bundling
- **Database ORM**: Drizzle ORM (configured for PostgreSQL in schema, MySQL in implementation)
- **Session Management**: Express sessions with memory store (configurable for production)
- **API Design**: RESTful API with `/api` prefix for all endpoints

**Key Design Decisions**:
- Dual database support: Drizzle schema defines PostgreSQL structure, but MySQL is used in production via mysql2 driver
- Automatic database initialization on server startup creates tables if missing
- Separation of concerns: routes.ts handles endpoints, storage.ts abstracts database operations
- Server-side rendering fallback serves index.html for all non-API routes (SPA support)

**Database Schema**:
The application uses a comprehensive schema including:
- Users (authentication and roles)
- Trips (travel packages with features, pricing, ratings)
- Hotels (accommodations with room types, availability windows)
- Cars (luxury vehicle rentals with specifications)
- Last-Minute Offers (time-limited deals with discounts)
- Bookings (user reservations with payment tracking)
- Reviews (user feedback with approval workflow)
- Payment Settings (configurable payment provider credentials)
- Subscribers (newsletter email collection)
- Support Tickets (customer service system)

### Authentication & Authorization

**Strategy**: Context-based authentication with role-based access control
- **Roles**: Admin, User, Guest
- **Storage**: localStorage for session persistence
- **Protected Routes**: Admin dashboard requires admin role
- **Default Credentials**: Hardcoded demo credentials for testing (admin@voyager.com / admin123)

**Architectural Choice**:
Simple authentication system using client-side storage rather than JWT or session cookies. Suitable for MVP but should be replaced with secure backend authentication for production.

### Payment Integration

**Provider**: Stripe
- **Configuration**: Dynamic Stripe key loading from database settings table
- **Fallback**: Environment variables (STRIPE_SECRET_KEY, VITE_STRIPE_PUBLISHABLE_KEY)
- **Implementation**: Stripe Elements for PCI-compliant card collection
- **Payment Flow**: Create PaymentIntent → Confirm via Stripe Elements → Update booking status

**Key Decision**:
Payment settings stored in database allow runtime configuration without redeployment. This enables admin panel management of API keys and supports future multi-provider scenarios.

### Build & Deployment

**Development**:
- Separate dev servers: Vite dev server (port 5000) for client, tsx for hot-reloading backend
- Concurrent development with HMR and runtime error overlays

**Production**:
- Client built to `dist/public` via Vite
- Server bundled to `dist/index.cjs` via esbuild with selective dependency bundling
- Static file serving from Express with SPA fallback
- Automated startup script (`start.js`) validates dependencies and database connection

**Architectural Choice**:
Two-stage build process separates client and server artifacts. Server bundling uses allowlist to reduce cold start times by minimizing file system calls. Production bundle includes database drivers (mysql2) but externalizes most dependencies.

### Data Flow Patterns

1. **Client → API → Database**: Standard CRUD operations via REST endpoints
2. **Real-time Updates**: Client refetches after mutations (React Query invalidation)
3. **Slug-based Routing**: Dynamic URL generation from titles for SEO
4. **Review Workflow**: Reviews require admin approval before display
5. **Booking Process**: Multi-step flow with date selection, payment, and confirmation

## External Dependencies

### Third-Party Services

**Stripe Payment Processing**:
- API Version: 2025-11-17.clover
- Required: Secret key (server) and Publishable key (client)
- Configuration: Database-first with environment variable fallback

**Unsplash Images**:
- Used for hero images and travel photography throughout the UI
- No API integration; direct image URLs

### Database

**Production Database**: MySQL (ProSite Hosting)
- Host: mysql-200-131.mysql.prositehosting.net
- Database: ocidb_01Raay53dC
- Connection pooling via mysql2 (max 10 connections)
- Automatic schema initialization via raw SQL queries

**Schema Management**: Drizzle ORM
- Schema defined in TypeScript (shared/schema.ts)
- PostgreSQL dialect in drizzle.config.ts
- Actual implementation uses MySQL via mysql2 driver
- Migration strategy: Auto-initialization rather than migration files

**Architectural Note**:
Mismatch between Drizzle schema (PostgreSQL) and runtime database (MySQL) suggests migration in progress or dual-target support. Production uses MySQL with manual table creation in `server/db.ts`, while schema files prepare for PostgreSQL deployment.

### Email Services

**Newsletter Subscription**:
- Subscriber emails stored in database
- No external email service currently integrated
- Prepared for future integration (schema includes subscribers table)

### Development Tools

**Replit Integration**:
- Custom Vite plugins for Replit deployment (cartographer, dev-banner)
- Meta image plugin for OpenGraph tags
- Runtime error modal overlay

**Key Dependencies**:
- **UI**: Radix UI primitives, shadcn/ui components
- **Forms**: React Hook Form, Zod validation, @hookform/resolvers
- **State**: TanStack Query, React Context
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Database**: Drizzle ORM, mysql2, @neondatabase/serverless
- **Payments**: Stripe SDK (@stripe/stripe-js, @stripe/react-stripe-js)
- **Charts**: Recharts (admin dashboard analytics)

### Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (for Drizzle, currently unused)
- `STRIPE_SECRET_KEY`: Stripe API secret (fallback if not in database)
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (client-side)
- `NODE_ENV`: Environment flag (development/production)
- `PORT`: Server port (default 5000)

Optional configuration:
- Payment settings managed via admin panel (stored in database)
- MySQL credentials hardcoded in server/db.ts (should be environment variables)