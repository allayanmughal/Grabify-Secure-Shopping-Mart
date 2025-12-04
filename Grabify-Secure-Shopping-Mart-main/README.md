# Grabify - Secure Online Shopping Mart

A modern, secure e-commerce platform built for the Web Development Competition.

![Grabify](https://img.shields.io/badge/Grabify-Secure%20Shopping-cyan)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🏆 Competition Requirements Fulfilled

### ✅ Architecture Requirements
- **Frontend** (`/app`) - Next.js 14 App Router with React components
- **Backend** (`/app/api`) - RESTful API routes for all operations
- **DLL/Library** (`/libs`) - Password-protected module for database operations
- **Database** (`/database`) - Firebase configuration and schema documentation

### ✅ Security Features
- **Password-Protected DLL Module** - All CRUD operations require server-side password
- **NoSQL Injection Prevention** - Zod schema validation on all inputs
- **Comprehensive Logging** - All sensitive actions logged for audit trail
- **Role-Based Access Control** - Separate Admin and User registration
- **Admin Secret Code** - Admin registration requires secret code

### ✅ Functionality
- ✅ Separate User & Admin Registration
- ✅ User Authentication (Firebase Auth)
- ✅ Product Catalog with Category Filters
- ✅ Search & Sort Products
- ✅ Shopping Cart with Animations
- ✅ Checkout with Payment Simulation
- ✅ Admin Dashboard for Product Management
- ✅ Security Logs Viewer
- ✅ Order History

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| Firebase | Authentication & Firestore Database |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| Zod | Runtime validation |
| Zustand | State management |

## 📁 Project Structure

```
├── app/                        # Frontend (Pages & Components)
│   ├── api/                   # Backend (REST API Routes)
│   │   ├── products/          # Product CRUD (uses DLL)
│   │   ├── auth/              # Authentication endpoints
│   │   ├── cart/              # Cart operations
│   │   ├── checkout/          # Payment processing
│   │   ├── logs/              # Security logs (Admin)
│   │   └── seed/              # Database seeding
│   ├── admin/                 
│   │   ├── page.tsx           # Admin dashboard
│   │   ├── register/          # Admin registration (secret code)
│   │   └── logs/              # Security logs viewer
│   ├── checkout/              # Checkout flow
│   ├── login/                 # User login
│   ├── register/              # Customer registration
│   ├── products/              # Product catalog
│   ├── orders/                # Order history
│   └── about/                 # About page
├── libs/                       # DLL Module (Password-Protected)
│   ├── secureProductDLL.ts    # Core CRUD operations
│   └── validationSchemas.ts   # Zod schemas
├── database/                  # Firebase Configuration
│   ├── firebaseConfig.ts      # Client-side Firebase
│   ├── firebaseAdmin.ts       # Server-side Firebase Admin
│   └── README.md              # Schema documentation
├── components/                # Reusable UI Components
│   ├── Navbar.tsx             # Navigation with user menu
│   ├── ProductCard.tsx        # Product display card
│   └── CartSidebar.tsx        # Shopping cart sidebar
├── store/                     # State Management
│   ├── useStore.ts            # Zustand store
│   └── authContext.tsx        # Auth provider
├── backend/                   # Backend documentation
└── frontend/                  # Frontend documentation
```

## 👥 Separate Registration System

### Customer Registration (`/register`)
- For regular shoppers
- Creates account with `role: "user"`
- Can browse, add to cart, and checkout

### Admin Registration (`/admin/register`)
- Requires **Admin Secret Code**
- Creates account with `role: "admin"`
- Full access to product management & logs

### 🔑 Admin Secret Code
```
GRABIFY_ADMIN_2025
```

## 🔐 DLL Security Implementation

The `libs/secureProductDLL.ts` simulates a compiled DLL with password protection:

```typescript
// All methods require password verification
static async insertProduct(
  dllPassword: string,  // Must match DLL_SECRET
  productData: Product,
  userId: string
): Promise<DLLResponse<Product>> {
  // 1. Verify password
  this.verifyPassword(dllPassword);
  
  // 2. Validate with Zod (NoSQL injection prevention)
  const validation = ProductSchema.safeParse(productData);
  
  // 3. Perform database operation
  // 4. Log the action
  // 5. Return result
}
```

**For Judges:** The DLL password is stored in environment variables and injected server-side in API routes. Client code never has access to the password.

## 🛡️ NoSQL Injection Prevention

Since we use Firebase (NoSQL), we implement equivalent SQL injection protection using Zod:

```typescript
export const ProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(100, 'Product name too long')
    .regex(/^[a-zA-Z0-9\s\-\_\.\,\!\'\&]+$/, 'Invalid characters'),
  price: z.number()
    .positive('Price must be positive')
    .max(999999, 'Price exceeds maximum'),
  // ... more validation
});
```

## 📊 Database Collections

| Collection | Description |
|------------|-------------|
| `users` | User accounts with roles (admin/user) |
| `products` | Product catalog with categories |
| `cart` | Shopping cart items |
| `orders` | Order history with payment info |
| `logs` | Security audit trail |

## 🛒 Product Categories

- **Electronics** - Headphones, Smartwatch, Power Bank, etc.
- **Clothing** - T-Shirts, Jackets, Sneakers, etc.
- **Home & Kitchen** - Coffee Maker, Cookware, Air Purifier, etc.
- **Sports & Fitness** - Yoga Mat, Dumbbells, Resistance Bands
- **Books & Stationery** - Journal, Fountain Pen, Desk Organizer

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Firestore & Auth enabled

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   DLL_SECRET=CUOnline_SecureDLL_2024!@#
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Quick Setup

1. **Register as Admin**: Go to `/admin/register` and use code `GRABIFY_ADMIN_2025`
2. **Add Products**: Go to `/products` and click "Seed Products" OR go to `/admin` to add manually
3. **Test Shopping**: Register a customer account at `/register` and try the full flow

## 📝 API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/products` | GET | List all products | Public |
| `/api/products` | POST | Create product | Admin |
| `/api/products` | PUT | Update product | Admin |
| `/api/products` | DELETE | Delete product | Admin |
| `/api/auth/register` | POST | Register user | Public |
| `/api/auth/login` | POST | Log login | Public |
| `/api/cart` | GET/POST/PUT/DELETE | Cart operations | User |
| `/api/checkout` | POST | Process order | User |
| `/api/logs` | GET | View security logs | Admin |
| `/api/seed` | POST | Seed sample products | Admin |

## 🎨 Design Features

- **Glassmorphism UI** - Modern frosted glass effect
- **Dark Mode** - Cyber/tech aesthetic with cyan & purple accents
- **Framer Motion** - Smooth animations and transitions
- **Responsive** - Mobile-first design
- **Category Filters** - Filter products by category
- **Real-time Search** - Instant product search
- **Optimized Performance** - Lazy loading, memoized components

## 🧪 Test Cards for Checkout

Use these test card numbers:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

## 📜 License

Built for educational/competition purposes.

---

## 🎯 For Judges

### Key Points to Demonstrate:

1. **DLL Module** (`/libs/secureProductDLL.ts`)
   - Password-protected class
   - All DB operations go through it
   - Server-side secret injection

2. **NoSQL Injection Prevention** (`/libs/validationSchemas.ts`)
   - Zod validation schemas
   - Strict type checking
   - Input sanitization

3. **Security Logs** (`/admin/logs`)
   - All actions logged
   - Login attempts tracked
   - DLL access recorded

4. **Separate Registration**
   - Customer: `/register`
   - Admin: `/admin/register` (requires secret code)

5. **Architecture**
   - `/app` - Frontend
   - `/app/api` - Backend
   - `/libs` - DLL Module
   - `/database` - Firebase Config

---

**Grabify** - Secure Shopping, Modern Design 🛒✨
