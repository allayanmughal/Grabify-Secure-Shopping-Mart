/**
 * ============================================
 * FIREBASE CONFIGURATION - DATABASE LAYER
 * ============================================
 * Grabify Secure Shopping Mart
 * 
 * This file contains the Firebase initialization
 * for both client-side and configuration exports.
 * 
 * Collections Schema:
 * - users: { uid, email, role: 'admin' | 'user', createdAt }
 * - products: { id, name, description, price, stock, imageUrl, category }
 * - cart: { userId, productId, quantity }
 * - orders: { id, userId, total, status, timestamp, dummyPaymentInfo }
 * - logs: { action, timestamp, userId, details }
 * ============================================
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export app for use in other modules
export default app;

// ============================================
// DATABASE SCHEMA DOCUMENTATION (For Judges)
// ============================================
// 
// COLLECTION: users
// -----------------
// {
//   uid: string,           // Firebase Auth UID
//   email: string,         // User email
//   role: 'admin' | 'user',// User role for access control
//   createdAt: Timestamp   // Account creation date
// }
//
// COLLECTION: products
// --------------------
// {
//   id: string,            // Auto-generated product ID
//   name: string,          // Product name
//   description: string,   // Product description
//   price: number,         // Price in USD
//   stock: number,         // Available inventory
//   imageUrl: string,      // Product image URL
//   category: string       // Product category
// }
//
// COLLECTION: cart
// ----------------
// {
//   userId: string,        // Reference to user
//   productId: string,     // Reference to product
//   quantity: number       // Quantity in cart
// }
//
// COLLECTION: orders
// ------------------
// {
//   id: string,            // Order ID
//   userId: string,        // Reference to user
//   items: array,          // Array of cart items
//   total: number,         // Total order amount
//   status: string,        // Order status
//   timestamp: Timestamp,  // Order date
//   dummyPaymentInfo: {    // Simulated payment info
//     cardLast4: string,
//     paymentMethod: string
//   }
// }
//
// COLLECTION: logs (Security Audit Trail)
// ---------------------------------------
// {
//   action: string,        // Action type (LOGIN, DLL_ACCESS, etc.)
//   timestamp: Timestamp,  // When action occurred
//   userId: string,        // Who performed action
//   details: object,       // Additional context
//   success: boolean       // Whether action succeeded
// }
// ============================================

