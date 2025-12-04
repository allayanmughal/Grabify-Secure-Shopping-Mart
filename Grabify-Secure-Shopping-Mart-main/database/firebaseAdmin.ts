/**
 * ============================================
 * FIREBASE ADMIN SDK - SERVER-SIDE ONLY
 * ============================================
 * Grabify Secure Shopping Mart
 * 
 * This module provides server-side Firebase access
 * with elevated privileges for backend operations.
 * ============================================
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

/**
 * Initialize Firebase Admin SDK (singleton pattern)
 * Only runs on server-side
 */
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // For demo/development - use project ID only
    // In production, use service account credentials
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || 
                      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      // Production: Use full service account
      adminApp = initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Development: Use project ID only (limited features)
      adminApp = initializeApp({
        projectId: projectId,
      });
    }
  } else {
    adminApp = getApps()[0];
  }
  
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
  
  return { adminApp, adminDb, adminAuth };
}

// Export getter functions to ensure lazy initialization
export function getAdminDb(): Firestore {
  if (!adminDb) {
    initializeFirebaseAdmin();
  }
  return adminDb!;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    initializeFirebaseAdmin();
  }
  return adminAuth!;
}

export function getAdminApp(): App {
  if (!adminApp) {
    initializeFirebaseAdmin();
  }
  return adminApp!;
}

