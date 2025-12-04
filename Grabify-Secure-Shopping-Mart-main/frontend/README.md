# Frontend Layer - Grabify Secure Shopping Mart

## Overview

The frontend is built with **Next.js 14 App Router** using React Server Components and Client Components.

## Frontend Location

All frontend pages and components are located in:

```
/app/                    # Pages (Next.js App Router)
├── page.tsx            # Home page
├── products/
│   └── page.tsx        # Product catalog
├── login/
│   └── page.tsx        # Login page
├── register/
│   └── page.tsx        # Registration page
├── checkout/
│   └── page.tsx        # Checkout flow
├── orders/
│   └── page.tsx        # Order history
├── admin/
│   ├── page.tsx        # Admin dashboard
│   └── logs/
│       └── page.tsx    # Security logs viewer
└── about/
    └── page.tsx        # About/architecture info

/components/             # Reusable UI Components
├── Navbar.tsx          # Navigation bar
├── ProductCard.tsx     # Product display card
└── CartSidebar.tsx     # Shopping cart sidebar

/store/                  # State Management
├── useStore.ts         # Zustand global store
└── authContext.tsx     # Firebase Auth context
```

## Design System

### Glassmorphism Theme

```css
.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Color Palette

- **Accent Cyan**: `#00f5ff` - Primary accent
- **Accent Purple**: `#a855f7` - Secondary accent
- **Accent Pink**: `#ec4899` - Highlights
- **Background**: Dark slate gradient

### Typography

- **Headings**: Orbitron (futuristic)
- **Body**: Rajdhani, Space Grotesk

## Animations

Using **Framer Motion** for:

- Page transitions
- Scroll reveals
- Hover effects
- Cart fly-out animations
- Loading states

## State Management

### Zustand Store (`/store/useStore.ts`)

```typescript
const useStore = create<StoreState>((set) => ({
  cart: [],
  user: null,
  addToCart: (product) => { ... },
  removeFromCart: (id) => { ... },
  // ... more actions
}));
```

### Auth Context (`/store/authContext.tsx`)

Provides Firebase authentication throughout the app:

- `signIn` - Email/password login
- `signUp` - User registration
- `signOut` - Logout
- `userData` - Current user info
- `isAdmin` - Admin role check

## Component Patterns

### Product Card

```tsx
<ProductCard product={product} index={index} />
```

Features:
- Glassmorphism card design
- Image with lazy loading
- Animated hover effects
- Quick add to cart
- Stock indicators

### Cart Sidebar

```tsx
<CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
```

Features:
- Slide-in animation
- Quantity controls
- Real-time total calculation
- Checkout button

## Responsive Design

Mobile-first approach with Tailwind breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## For Judges

This frontend demonstrates:

- Modern React patterns (hooks, context)
- Beautiful glassmorphism UI design
- Smooth Framer Motion animations
- Responsive mobile-first layout
- Clean component architecture
- Proper state management

