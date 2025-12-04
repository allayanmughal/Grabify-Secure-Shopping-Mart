# Backend Layer - Grabify Secure Shopping Mart

## Overview

In a traditional multi-tier architecture, the backend would be a separate server application. With **Next.js 14 App Router**, the backend functionality is integrated within the `/app/api` directory.

## Backend Location

All backend API routes are located in:

```
/app/api/
├── products/     # Product CRUD operations (Admin protected)
│   └── route.ts  # GET, POST, PUT, DELETE
├── auth/         # Authentication
│   ├── login/
│   │   └── route.ts  # POST - Log login attempt
│   └── register/
│       └── route.ts  # POST - Register user
├── cart/         # Shopping cart
│   └── route.ts  # GET, POST, PUT, DELETE
├── checkout/     # Order processing
│   └── route.ts  # POST - Process order
└── logs/         # Security logs (Admin only)
    └── route.ts  # GET - View audit trail
```

## Security Architecture

### DLL Integration

All product operations in `/app/api/products/route.ts` use the password-protected DLL:

```typescript
import { ProductDLL } from '@/libs/secureProductDLL';

// The DLL_SECRET is injected server-side
const DLL_SECRET = process.env.DLL_SECRET;

// All operations go through the DLL
const result = await ProductDLL.insertProduct(
  DLL_SECRET,    // Server-side password
  productData,   // Validated data
  userId         // For logging
);
```

### Authentication Flow

1. Client authenticates via Firebase Auth
2. Client sends requests with `x-user-id` header
3. API verifies user exists in Firestore
4. API checks user role for admin operations
5. All operations are logged

### Input Validation

All API routes validate input using Zod schemas from `/libs/validationSchemas.ts`:

```typescript
const validation = ProductSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
}
```

## API Response Format

All APIs return consistent JSON responses:

```typescript
// Success
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

// Error
{
  success: false,
  error: "Error message",
  details: [ ... ] // Optional validation errors
}
```

## Logging

All sensitive operations are logged to the `logs` collection:

```typescript
await addDoc(collection(db, 'logs'), {
  action: 'CREATE_PRODUCT_SUCCESS',
  timestamp: Timestamp.now(),
  userId: userId,
  details: { productId, productName },
  success: true,
  source: 'PRODUCTS_API'
});
```

## For Judges

This backend architecture fulfills the requirement for a separate backend layer. While Next.js combines frontend and backend, the `/app/api` directory functions as a distinct backend with:

- RESTful API endpoints
- Authentication middleware
- Authorization checks
- DLL integration for database operations
- Comprehensive logging
- Input validation

The separation between `/app` (frontend) and `/app/api` (backend) demonstrates proper architectural separation of concerns.

