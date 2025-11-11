# ShopHub E-Commerce Platform

## Recent Changes (November 11, 2025)

**Latest Updates:**

1. **Google OAuth Sign-In/Sign-Up**
   - Integrated Google OAuth 2.0 authentication using Passport.js
   - Added "Continue with Google" buttons to login and signup pages (always visible)
   - User schema updated to support Google authentication (googleId field, optional password)
   - Google-authenticated users are automatically created with customer role
   - Existing email/password authentication remains fully functional
   - Protected against password comparison errors for OAuth-only users
   - Google OAuth routes and strategy conditionally enabled based on credentials
   - Buttons work automatically once credentials are provided (no additional config needed)
   - Required environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
   - Redirect URI: https://02ff2fa0-811e-48e5-998a-84a627415592-00-1krbtedinxp7l.spock.replit.dev/api/auth/google/callback

2. **Customer Phone Number Requirement**
   - Added phone number field to users table (nullable for existing users, required for new signups)
   - Updated signup form to require phone number in E.164 format (e.g., +233244444444)
   - Frontend and backend validation ensures proper phone format
   - Phone numbers will be used for future OTP/SMS verification features

2. **Password Reset Infrastructure**
   - Created password_resets table for future forgot password/OTP functionality
   - Table tracks OTP codes, expiration times, attempt counts, and verification status
   - Foundation ready for Twilio SMS integration (pending TWILIO_VERIFY_SERVICE_SID)

3. **Admin Password Reset Feature**
   - Super admins can now reset passwords for vendor and support agent users
   - Added dedicated "Reset Password" button with key icon in User Management page
   - Secure endpoint (POST /api/users/:id/reset-password) with super_admin role requirement
   - Password requirements enforced: minimum 6 characters, bcrypt hashing

4. **Paystack Payment Fixed**
   - Configured PAYSTACK_SECRET_KEY environment variable
   - Payment initialization error resolved
   - Customers can now complete checkout and process payments

5. **Customer List Enhancement**
   - Created dedicated /api/customers endpoint
   - Customers now appear in Customers list immediately upon signup (not User Management)
   - Shows all customer accounts with order statistics and active status

**Twilio Integration Note:**
- User dismissed Replit's Twilio connector integration
- Manual Twilio configuration required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
- Once configured, forgot password with SMS OTP can be fully implemented

**Previous Features:**

1. **Authentication System for Customer Access**
   - Created public signup route (POST /api/auth/signup) with automatic customer role assignment
   - Built signup and login pages with form validation
   - Added authentication guards to protect checkout and order tracking routes
   - Fixed checkout guard to properly wait for auth state before redirecting
   - Default test accounts available: admin@shophub.com/admin123, vendor@shophub.com/vendor123

2. **Paystack Payment Integration**
   - Integrated secure payment processing using Replit environment variables
   - Backend initializes Paystack transactions and returns authorization URL
   - Payment flow: checkout → Paystack → order confirmation
   - Secret key securely stored in PAYSTACK_SECRET_KEY environment variable

3. **Functional Search Feature**
   - Implemented SearchContext for cross-component state management
   - Search filters products by name, description, and category
   - Real-time filtering as users type in the search bar
   - Search state persists across navigation within the storefront

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
- PostgreSQL as primary database via Replit's managed Neon PostgreSQL service
- Drizzle ORM for type-safe database queries and schema management
- Schema synchronization via `npm run db:push` command

**Schema Design:**
- **Users Table:** Email-based authentication with role-based permissions and account status
- **Products Table:** Comprehensive product data including pricing, inventory, ratings, and featured status
- **Orders Table:** Order management with customer details, items (stored as JSON), pricing breakdown, and status tracking
- **Promotions Table:** Marketing campaigns and discount management

**Data Access Pattern:**
- Storage abstraction layer (`IStorage` interface) allowing database implementation swapping
- DatabaseStorage implementation provides PostgreSQL data access via Drizzle ORM
- Consistent CRUD operations across all entities using type-safe SQL queries

**Key Design Decisions:**
- **Abstraction Layer:** Storage interface allows switching database implementations without changing application code
- **JSON Fields:** Order items stored as JSON for flexibility in product configurations
- **Soft Deletes:** User deactivation instead of deletion for data integrity
- **Denormalization:** Order data duplicates customer info for historical accuracy
- **Migration Strategy:** Schema-first development using Drizzle ORM with direct database push instead of manual migrations

### External Dependencies

**Third-Party Services:**
- **Replit PostgreSQL:** Managed Neon PostgreSQL database for data persistence
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
- **PostgreSQL First:** Using Replit's managed PostgreSQL for reliable, scalable data persistence
- **Minimal Dependencies:** Carefully selected libraries to keep bundle size manageable
- **Replit Optimization:** Special tooling for seamless Replit deployment and development experience