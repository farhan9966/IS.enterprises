# DocumentTrack Pro - IS Enterprises Document Management System

## Overview

DocumentTrack Pro is a comprehensive document management system built for tracking and managing documents across three main categories: vehicles, employees, and miscellaneous items. The system provides role-based access control, document expiration tracking, audit trails, and a modern web interface.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Development Environment**: Replit-optimized setup

### Monorepo Structure
The application follows a monorepo pattern with clear separation of concerns:
```
├── client/           # React frontend application
├── server/           # Express.js backend API
├── shared/           # Shared types, schemas, and utilities
├── uploads/          # File storage directory
└── migrations/       # Database migration files
```

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database Access**: Drizzle ORM with type-safe queries
- **Authentication**: Passport.js with OpenID Connect strategy
- **File Uploads**: Multer middleware for document handling
- **Session Management**: Express-session with PostgreSQL store

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Users**: Authentication and role management (admin, manager, staff)
- **Vehicles**: Vehicle information and associated documents
- **Employees**: Employee records and related documents
- **Documents**: Central document storage with categorization
- **Document Categories**: Hierarchical organization system
- **Document Downloads**: Audit trail for document access
- **Sessions**: Secure session storage

### Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions
- **Role-Based Access**: Three-tier permission system (admin, manager, staff)
- **Security**: HTTP-only cookies, CSRF protection, secure session handling

## Data Flow

### Document Upload Process
1. User selects file and provides metadata through React form
2. Frontend validates file type and size constraints
3. Multer middleware processes file upload to local storage
4. Document metadata stored in PostgreSQL via Drizzle ORM
5. Real-time UI updates via TanStack Query invalidation

### Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect provider validates credentials
3. User profile synchronized with local database
4. Session established with PostgreSQL-backed storage
5. Role-based route protection enforced on both frontend and backend

### Document Access Flow
1. User requests document through authenticated API
2. Permission validation based on user role and document type
3. Download tracked in audit log
4. File served with appropriate security headers

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection pooling
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Accessible UI component primitives
- **react-hook-form**: Form state management
- **wouter**: Lightweight client-side routing

### Development Tools
- **TypeScript**: Type safety across the stack
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Production bundle optimization

### File Upload Dependencies
- **multer**: Multipart form handling
- **connect-pg-simple**: PostgreSQL session store
- **memoizee**: Performance optimization for repeated operations

## Deployment Strategy

### Replit Deployment
- **Platform**: Replit autoscale deployment
- **Build Process**: Vite frontend build + ESBuild backend bundle
- **Environment**: Node.js 20 with PostgreSQL 16
- **Static Assets**: Served from built distribution directory

### Production Configuration
- **Database**: Neon PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-backed session persistence
- **File Storage**: Local filesystem with configurable upload limits
- **Security**: Environment-based secret management

### Development Setup
- **Hot Reload**: Vite development server with HMR
- **Database Migrations**: Drizzle Kit for schema management
- **Type Checking**: Incremental TypeScript compilation
- **Development Workflow**: Integrated Replit environment

## Changelog

Changelog:
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.