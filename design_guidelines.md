# E-Commerce Platform Design Guidelines

## Design Approach: Reference-Based (E-Commerce Leaders)

**Primary References:** Jumia, Shopify, Amazon, Lazada
**Rationale:** E-commerce platforms require proven conversion-optimized patterns, visual product showcasing, and trust-building design elements. Drawing from established e-commerce leaders ensures familiar, intuitive user experiences.

## Core Design Philosophy

**Customer Storefront:** Clean, product-focused design that builds trust and drives conversions
**Admin Dashboard:** Data-dense, efficient interface prioritizing speed and clarity over visual flair

---

## Color Palette

### Customer Storefront
- **Primary Brand:** 25 85% 53% (vibrant orange, Jumia-inspired for CTAs and accents)
- **Dark Mode Primary:** 25 75% 60% (softer orange for dark backgrounds)
- **Neutral Base:** 220 15% 97% (light), 220 15% 20% (dark)
- **Success/Stock:** 142 70% 45% (in-stock indicators)
- **Warning:** 38 92% 50% (low stock alerts)
- **Trust Accent:** 217 91% 60% (secure checkout, verified badges)

### Admin Dashboard
- **Primary:** 220 13% 18% (professional dark slate)
- **Accent:** 25 85% 53% (brand consistency)
- **Data Visualization:** Varied categorical colors for charts
- **Status Colors:** Green (completed), Yellow (pending), Red (cancelled), Blue (processing)

---

## Typography

**Font Stack:**
- **Primary:** 'Inter' (Google Fonts) - Clean, modern sans-serif for UI
- **Display/Headers:** 'Manrope' (Google Fonts) - Friendly, approachable for marketing content
- **Data/Tables:** 'JetBrains Mono' (Google Fonts) - Monospace for admin dashboard tables and SKUs

**Scale:**
- Hero Headlines: text-5xl md:text-6xl font-bold
- Section Headers: text-3xl md:text-4xl font-semibold
- Product Names: text-lg font-medium
- Body: text-base leading-relaxed
- Small/Meta: text-sm text-gray-600 dark:text-gray-400

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20 (p-4, m-8, gap-6, etc.)

**Customer Storefront:**
- Container: max-w-7xl mx-auto px-4 md:px-6
- Product Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6
- Section Padding: py-12 md:py-20

**Admin Dashboard:**
- Sidebar Navigation: 256px fixed width
- Main Content: flex-1 with max-w-full overflow-x-auto
- Card Spacing: p-6, gap-4

---

## Component Library

### Customer Storefront Components

**Hero Section:**
- Full-width banner with background image (1920x800px promotional imagery)
- Overlay gradient: from-black/60 to-black/30
- Centered CTA with primary button + secondary outline button (blurred background)
- Trust indicators below (Free Shipping, Secure Payment, 24/7 Support)

**Navigation:**
- Sticky header with logo, search bar (prominent), category menu, cart icon with badge
- Mobile: Hamburger menu, persistent search icon, cart icon
- Category mega-menu on hover (desktop) with images

**Product Cards:**
- Image aspect-ratio-square with hover zoom effect
- Product name (2 lines, truncated)
- Price (bold) with original price strike-through if discounted
- Rating stars + review count
- Stock status badge (top-right corner)
- Quick "Add to Cart" button on hover

**Shopping Cart:**
- Slide-out drawer from right
- Product thumbnail + name + quantity selector + price
- Subtotal, shipping estimate, total
- Prominent "Checkout" CTA

**Checkout Flow:**
- Multi-step progress indicator (Shipping → Payment → Review)
- Split layout: Form (left 60%) + Order Summary (right 40%, sticky)
- Payment gateway integration badges for trust

### Admin Dashboard Components

**Sidebar Navigation:**
- Dark background with icon + label menu items
- Grouped sections: Products, Orders, Inventory, Users, Analytics, Settings
- Active state: colored left border + background highlight

**Data Tables:**
- Striped rows for readability
- Sortable column headers
- Action dropdowns (Edit, Delete, View Details)
- Pagination controls
- Bulk selection checkboxes

**Product Management:**
- Split view: Product list (left) + Detail panel (right)
- Drag-and-drop image upload with multi-image gallery
- Rich text editor for descriptions
- Category/tag multi-select dropdowns

**Dashboard Cards:**
- Metric cards: Large number + percentage change + mini sparkline chart
- Color-coded trends (green up, red down)
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

**Order Management:**
- Kanban-style board OR tabbed interface (Pending, Processing, Shipped, Delivered)
- Order cards with customer info, items preview, total, status dropdown
- Timeline view for order history

**Analytics Section:**
- Line charts for sales trends (Chart.js via CDN)
- Bar charts for top products
- Pie charts for category revenue breakdown
- Date range picker for filtering

---

## Imagery Strategy

**Hero Images:** 
- Large promotional banners (1920x800px) showcasing featured categories or sales
- 2-3 rotating slides with smooth transitions

**Product Images:**
- Square thumbnails (600x600px minimum) with zoom functionality
- Multiple angles in product detail view with thumbnail gallery
- Lifestyle images in product descriptions

**Category Banners:**
- Wide format (1400x400px) for category pages
- Branded overlays with category name and item count

**Trust Elements:**
- Payment method logos (Visa, Mastercard, PayPal)
- Security badges (SSL, verified seller icons)
- Delivery partner logos

---

## Responsive Breakpoints

- Mobile: < 768px (single column, stacked navigation)
- Tablet: 768px - 1024px (2-column grids, condensed layouts)
- Desktop: > 1024px (full multi-column, expanded features)

**Mobile Optimizations:**
- Bottom navigation bar (Home, Categories, Cart, Account)
- Touch-friendly tap targets (min 44px)
- Swipeable product image galleries

---

## Key UX Patterns

**Customer Flow:**
1. Hero → Category Navigation → Product Grid → Product Detail → Cart → Checkout
2. Persistent cart icon with item count
3. Breadcrumb navigation on all pages
4. Recently viewed products section

**Admin Flow:**
1. Dashboard overview → Detailed management sections
2. Quick actions always visible (Add Product, Create Order)
3. Search-first approach for finding orders/products
4. Inline editing where possible

**Accessibility:**
- Dark mode toggle in header (customer) and settings (admin)
- Form inputs with visible labels and error states
- Sufficient color contrast (WCAG AA minimum)
- Keyboard navigation support