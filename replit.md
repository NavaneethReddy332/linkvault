# Vault - Personal Link Space

## Overview

Vault is a personal link management application that allows users to save, organize, and access their bookmarks across devices. Users authenticate via Google OAuth, can create custom groups/sections for organizing links, and manage their saved content through a clean, minimal interface.

The application follows a full-stack TypeScript architecture with React on the frontend and Express on the backend, using Turso (LibSQL) as the database with Drizzle ORM for type-safe database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Query for server state, React Context for UI state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion for transitions and micro-interactions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: Turso (LibSQL - SQLite-compatible edge database)
- **ORM**: Drizzle ORM with SQLite dialect
- **Authentication**: Custom Google OAuth 2.0 implementation with session cookies
- **Session Management**: Cookie-based sessions stored in database

### Data Model
The schema defines four main entities:
- **users**: Core user data with Google OAuth integration and ban functionality
- **sessions**: Authentication sessions with expiration tracking
- **groups**: User-created categories for organizing links
- **links**: Saved URLs with title, optional notes, group assignment, pin status (isPinned), and click tracking (clickCount)

### API Design
RESTful API endpoints under `/api/` prefix:
- Authentication routes (`/api/auth/*`) for Google OAuth flow
- Account management routes (`/api/account/*`) for stats and deletion
- CRUD routes for groups and links

### Build System
- Development: Vite dev server with HMR for client, tsx for server
- Production: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Database migrations handled via custom migration script in `server/migrate.ts`

## External Dependencies

### Database
- **Turso**: Edge SQLite database service
  - Requires `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables
  - Uses LibSQL client for connections

### Authentication
- **Google OAuth 2.0**: Primary authentication method
  - Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
  - Handles user creation and session management

### Third-Party Services
- **Google Favicon API**: Used for displaying website favicons in link cards
- **Google Fonts**: DM Sans and Inter fonts for typography

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `drizzle-orm` + `@libsql/client`: Database access
- `zod` + `drizzle-zod`: Schema validation
- `framer-motion`: Animations
- Full shadcn/ui component suite with Radix UI primitives