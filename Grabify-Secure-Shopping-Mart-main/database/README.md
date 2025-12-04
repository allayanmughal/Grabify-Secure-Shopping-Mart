# Database Layer - Grabify Secure Shopping Mart

## Overview
This folder contains all database configuration and connection logic for the CUOnline application.

## Architecture
```
database/
├── firebaseConfig.ts    # Client-side Firebase initialization
├── firebaseAdmin.ts     # Server-side Firebase Admin SDK
└── README.md            # This documentation
```

## Collections Schema

### 1. Users Collection
```javascript
{
  uid: string,           // Firebase Auth UID
  email: string,         // User email address
  role: 'admin' | 'user',// Access control role
  createdAt: Timestamp   // Account creation timestamp
}
```

### 2. Products Collection
```javascript
{
  id: string,            // Product unique identifier
  name: string,          // Product display name
  description: string,   // Product description
  price: number,         // Price in USD
  stock: number,         // Available inventory count
  imageUrl: string,      // Product image URL
  category: string       // Product category
}
```

### 3. Cart Collection
```javascript
{
  userId: string,        // Reference to user document
  productId: string,     // Reference to product document
  quantity: number       // Quantity of product in cart
}
```

### 4. Orders Collection
```javascript
{
  id: string,            // Order unique identifier
  userId: string,        // Reference to user who placed order
  items: array,          // Array of ordered items
  total: number,         // Total order amount
  status: string,        // 'pending' | 'processing' | 'shipped' | 'delivered'
  timestamp: Timestamp,  // Order placement time
  dummyPaymentInfo: {    // Simulated payment details
    cardLast4: string,
    paymentMethod: string
  }
}
```

### 5. Logs Collection (Security Audit Trail)
```javascript
{
  action: string,        // Action type (LOGIN_ATTEMPT, DLL_ACCESS, CHECKOUT, etc.)
  timestamp: Timestamp,  // When the action occurred
  userId: string,        // User who performed the action (if applicable)
  details: object,       // Additional context about the action
  success: boolean,      // Whether the action succeeded
  ipAddress: string      // Client IP address (when available)
}
```

## Security Notes
- All sensitive operations are logged to the `logs` collection
- The `libs/secureProductDLL.js` module controls all product CRUD operations
- Admin authentication is required for product management
- Zod validation prevents NoSQL injection attacks

## Firebase Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /cart/{cartId} {
      allow read, write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    match /logs/{logId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if true;
    }
  }
}
```

