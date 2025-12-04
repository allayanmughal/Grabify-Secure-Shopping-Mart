/**
 * ============================================================================
 * AUTH REGISTER API - User Registration
 * ============================================================================
 * Grabify Secure Shopping Mart
 * 
 * Handles user registration with:
 * - Email/password validation using Zod
 * - Firebase Auth account creation
 * - User document creation in Firestore
 * - Login attempt logging for security audit
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRegistrationSchema } from '@/libs/validationSchemas';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';

/**
 * Log registration attempt
 */
async function logRegistrationAttempt(
  email: string,
  success: boolean,
  details: Record<string, unknown>
): Promise<void> {
  try {
    await addDoc(collection(db, 'logs'), {
      action: 'REGISTRATION_ATTEMPT',
      timestamp: Timestamp.now(),
      userId: null,
      details: {
        email,
        ...details,
      },
      success,
      source: 'AUTH_API',
    });
  } catch (error) {
    console.error('Failed to log registration:', error);
  }
}

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod (Injection Prevention)
    const validationResult = UserRegistrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      await logRegistrationAttempt(body.email || 'unknown', false, {
        reason: 'Validation failed',
        errors: validationResult.error.errors,
      });
      
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;
    
    // Note: Actual Firebase Auth registration happens on client-side
    // This endpoint creates the user document in Firestore
    // The client sends the UID after successful auth registration
    
    // Check if this is a user document creation request
    const uid = request.headers.get('x-user-id');
    
    if (uid) {
      // Create user document in Firestore
      const userRef = doc(db, 'users', uid);
      const existingUser = await getDoc(userRef);
      
      if (existingUser.exists()) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      }
      
      // Determine role (first user is admin, others are regular users)
      // In production, admin assignment should be more secure
      const role = 'user';
      
      await setDoc(userRef, {
        uid,
        email,
        role,
        createdAt: Timestamp.now(),
      });
      
      await logRegistrationAttempt(email, true, {
        uid,
        role,
      });
      
      return NextResponse.json({
        success: true,
        message: 'User registered successfully',
        user: {
          uid,
          email,
          role,
        },
      }, { status: 201 });
    }
    
    // If no UID, just validate the input
    return NextResponse.json({
      success: true,
      message: 'Validation passed. Proceed with Firebase Auth registration.',
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    await logRegistrationAttempt('unknown', false, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

