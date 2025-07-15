# SnapServe - QR Restaurant Ordering Platform

## Overview

SnapServe is a comprehensive, mobile-first QR code restaurant ordering platform with AI-powered features. The system provides three distinct user experiences: customer ordering via QR codes, staff order management dashboard, and admin panel for restaurant management. The platform integrates AI capabilities for personalized recommendations, smart upselling, inventory predictions, and sentiment analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **Tailwind CSS** + **shadcn/ui** component library for styling
- **Mobile-first responsive design** optimized for smartphones and tablets

### Backend Architecture
- **Express.js** with TypeScript for the REST API server
- **WebSocket (ws)** for real-time communication between staff and customers
- **Session-based authentication** using express-session with Passport.js
- **PostgreSQL** database with Drizzle ORM for type-safe database operations
- **Neon Database** as the PostgreSQL provider (@neondatabase/serverless)

### Authentication System
- **Passport.js** with LocalStrategy for username/password authentication
- **Role-based access control** (customer, staff, admin roles)
- **Session management** with secure HTTP-only cookies
- **Password hashing** using Node.js crypto.scrypt

## Key Components

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Users**: Authentication and role management
- **Restaurants**: Restaurant information and settings
- **Tables**: QR code management and table configuration
- **Categories**: Menu organization
- **Menu Items**: Product catalog with pricing and availability
- **Orders**: Customer order tracking with status management
- **Order Items**: Line items for each order
- **Feedback**: Customer feedback and sentiment analysis
- **Inventory**: Stock management and predictions

### AI Integration
- **OpenAI GPT-4o** integration for multiple AI features:
  - Personalized meal recommendations based on order history
  - Smart upselling suggestions at checkout
  - Inventory prediction and low-stock alerts
  - Sentiment analysis of customer feedback
  - Natural language chat assistant for customer queries

### Real-time Features
- **WebSocket server** for instant order notifications
- **Live order status updates** for staff dashboard
- **Real-time table monitoring** and occupancy tracking
- **Instant feedback alerts** for negative sentiment detection

### UI Components
- **shadcn/ui** component library providing:
  - Form components (Input, Button, Select, etc.)
  - Layout components (Card, Dialog, Tabs, etc.)
  - Data display components (Badge, Table, Chart, etc.)
  - Navigation components (Menu, Breadcrumb, etc.)

## Data Flow

### Customer Ordering Flow
1. Customer scans table-specific QR code
2. Redirected to `/menu/[tableId]` with table context
3. Browse categorized menu items with AI recommendations
4. Add items to cart with special instructions
5. Checkout with smart upsell suggestions
6. Real-time order tracking and status updates

### Staff Management Flow
1. Staff login with role-based authentication
2. Real-time order queue with WebSocket updates
3. Order status management (pending → preparing → ready → served)
4. Manual order creation for walk-in customers
5. Sentiment analysis alerts for immediate issue resolution

### Admin Panel Flow
1. Admin authentication with elevated privileges
2. Full CRUD operations for menu items, categories, and tables
3. QR code generation and management for tables
4. Staff account management and role assignment
5. Analytics dashboard with sales and performance metrics
6. AI-powered inventory predictions and alerts

## External Dependencies

### Core Dependencies
- **React ecosystem**: React 18, React DOM, TypeScript
- **Routing**: Wouter for client-side routing
- **State management**: TanStack Query for server state
- **Styling**: Tailwind CSS, shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Authentication**: Passport.js, express-session
- **Real-time**: WebSocket (ws library)

### AI and External Services
- **OpenAI API** for GPT-4o integration
- **Web Speech API** for voice ordering (browser native)
- **Date handling**: date-fns for timestamp manipulation
- **Unique IDs**: nanoid for generating QR codes and session IDs

### Development Tools
- **Build tools**: Vite, esbuild for production builds
- **Type checking**: TypeScript compiler
- **Database migrations**: Drizzle Kit for schema management
- **Development**: tsx for TypeScript execution

## Deployment Strategy

### Development Environment
- **Local development** with Vite dev server and hot reload
- **Database**: Neon Database with connection pooling
- **Session storage**: In-memory store for development
- **WebSocket**: Integrated with HTTP server for real-time features

### Production Considerations
- **Build process**: Vite builds client, esbuild bundles server
- **Environment variables**: DATABASE_URL, OPENAI_API_KEY, SESSION_SECRET
- **Session persistence**: Configurable session store (currently in-memory)
- **Security**: HTTPS enforcement, secure cookies, CORS configuration
- **Database**: PostgreSQL with connection pooling via Neon

### Scaling Architecture
- **Stateless server design** allows horizontal scaling
- **Database connection pooling** for efficient resource usage
- **WebSocket clustering** support for multi-instance deployments
- **CDN-ready static assets** for global distribution
- **Environment-based configuration** for different deployment stages

The architecture prioritizes mobile-first user experience, real-time capabilities, and AI-enhanced features while maintaining clean separation of concerns and scalable design patterns.