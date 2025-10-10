# ShopHub E-Commerce Platform

## Overview

ShopHub is a full-stack e-commerce platform built with modern web technologies. It features a customer-facing storefront for browsing and purchasing products, and a comprehensive admin dashboard for managing inventory, orders, customers, and promotions. The platform is designed with conversion optimization in mind, drawing inspiration from established e-commerce leaders like Jumia, Shopify, Amazon, and Lazada.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18+ with TypeScript for type safety and modern component patterns
- Vite as the build tool and development server for fast HMR and optimized builds
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management with automatic caching and refetching
- React Hook Form with Zod for form validation and schema-based data validation

**UI Framework:**
- shadcn/ui component library based on Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Custom theming system supporting light/dark modes with CSS variables
- Design follows conversion-optimized patterns from e-commerce leaders

**State Management:**
- Context API for global state (Authentication, Cart, Theme)
- Local storage for cart persistence across sessions
- React Query for server state caching and synchronization

**Key Design Decisions:**
- **Separation of Concerns:** Customer storefront and admin dashboard have distinct visual identities - clean and product-focused for customers, data-dense and efficient for admins
- **Accessibility First:** Built on Radix UI primitives ensuring WCAG compliance
- **Performance:** Code splitting via dynamic imports, optimized images, and minimal bundle size with Vite

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js for the REST API server
- TypeScript for type safety across the entire stack
- Passport.js with Local Strategy for authentication
- Express Session for session management
- bcrypt.js for password hashing

**Authentication & Authorization:**
- Session-based authentication with httpOnly cookies for security
- Role-based access control (RBAC) with four user roles:
  - `super_admin`: Full system access
  - `vendor`: Product and inventory management
  - `support_agent`: Order and customer support
  - `customer`: Standard user access
- Middleware guards (`requireAuth`, `requireRole`) for route protection

**API Design:**
- RESTful endpoints organized by resource type (auth, products, orders, users, promotions)
- Consistent error handling and validation using Zod schemas
- Input validation at the API layer before database operations

**Key Design Decisions:**
- **Session vs JWT:** Chose session-based auth for better security and server-side session invalidation
- **Middleware Pattern:** Reusable auth middleware for consistent security across routes
- **Validation Layer:** Zod schemas shared between client and server for type-safe data flow

### Data Storage Architecture

**Database:**
- PostgreSQL as primary database (via Drizzle ORM configuration)
- Firebase Firestore for actual storage implementation (dual-database strategy)
- Drizzle ORM for type-safe database queries and migrations

**Schema Design:**
- **Users Table:** Email-based authentication with role-based permissions and account status
- **Products Table:** Comprehensive product data including pricing, inventory, ratings, and featured status
- **Orders Table:** Order management with customer details, items (stored as JSON), pricing breakdown, and status tracking
- **Promotions Table:** Marketing campaigns and discount management

**Data Access Pattern:**
- Storage abstraction layer (`IStorage` interface) allowing database implementation swapping
- FirestoreStorage implementation provides concrete data access
- Consistent CRUD operations across all entities

**Key Design Decisions:**
- **Abstraction Layer:** Storage interface allows switching between PostgreSQL and Firestore without changing application code
- **JSON Fields:** Order items stored as JSON for flexibility in product configurations
- **Soft Deletes:** User deactivation instead of deletion for data integrity
- **Denormalization:** Order data duplicates customer info for historical accuracy

### External Dependencies

**Third-Party Services:**
- **Firebase Admin SDK:** Firestore database integration and authentication infrastructure
- **Google Fonts:** Inter, Manrope, and JetBrains Mono for typography system

**Key Libraries:**
- **@neondatabase/serverless:** PostgreSQL adapter for serverless environments
- **Drizzle ORM:** Type-safe database toolkit with migration support
- **Radix UI:** Comprehensive suite of accessible UI primitives
- **Recharts:** Data visualization for admin analytics dashboard
- **date-fns:** Date manipulation and formatting
- **class-variance-authority (cva):** Type-safe component variant management
- **Embla Carousel:** Touch-friendly carousel for product showcases

**Development Tools:**
- **ESBuild:** Fast JavaScript bundler for production builds
- **tsx:** TypeScript execution for development server
- **Replit-specific plugins:** Development banner, cartographer, and error overlay for Replit environment

**Key Design Decisions:**
- **Firebase Integration:** Used for managed database infrastructure with potential migration path to self-hosted PostgreSQL
- **Minimal Dependencies:** Carefully selected libraries to keep bundle size manageable
- **Replit Optimization:** Special tooling for seamless Replit deployment and development experience