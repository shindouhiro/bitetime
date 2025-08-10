# Overview

This is a kindergarten food ordering system (幼儿园订餐系统) built as a full-stack web application. The system provides dual interfaces for customers and merchants, enabling online food ordering with features like menu browsing, shopping cart management, address handling, and order processing. The application uses modern web technologies with a React frontend, Express.js backend, and PostgreSQL database, designed specifically for kindergarten meal ordering needs.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the client-side application
- **Vite** as the build tool and development server
- **TailwindCSS** with shadcn/ui components for styling and UI consistency
- **Wouter** for client-side routing
- **TanStack Query (React Query)** for server state management and caching
- **Context API** for shopping cart state management
- **React Hook Form** with Zod validation for form handling

## Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with proper HTTP methods and status codes
- **In-memory storage** with interface-based design for easy database migration
- **Middleware-based** request logging and error handling
- **Zod schemas** for request validation shared between client and server

## Database Design
- **PostgreSQL** with Drizzle ORM for type-safe database operations
- **Neon Database** as the PostgreSQL provider
- **Schema-first** approach with shared type definitions
- Core entities: Users (customers/merchants), Food Items, Addresses, Orders
- **JSONB** storage for flexible order item data

## State Management
- **Shopping Cart**: Context-based state with local storage persistence
- **Server State**: TanStack Query for API data caching and synchronization
- **Form State**: React Hook Form for form validation and submission

## Authentication & Authorization
- **Role-based** user system (customer/merchant)
- **Session-based** authentication (infrastructure ready)
- **Mock authentication** currently implemented for development

## UI/UX Architecture
- **Dual Interface**: Separate customer and merchant dashboards
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Library**: shadcn/ui for consistent design system
- **Chinese Language**: Primary interface language with proper typography

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for Neon
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and schema management tools

## Frontend Libraries
- **@radix-ui/react-**: Headless UI components for accessibility
- **@tanstack/react-query**: Server state management
- **class-variance-authority**: Component variant management
- **embla-carousel-react**: Carousel/slider functionality
- **date-fns**: Date manipulation and formatting

## Development Tools
- **Vite**: Build tool with HMR and development server
- **TypeScript**: Static type checking
- **TailwindCSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with Autoprefixer

## Backend Dependencies
- **express**: Web application framework
- **connect-pg-simple**: PostgreSQL session store
- **zod**: Runtime type validation
- **tsx**: TypeScript execution for development

## Build & Deployment
- **esbuild**: Fast JavaScript bundler for production builds
- **Replit integration**: Development environment with runtime error handling