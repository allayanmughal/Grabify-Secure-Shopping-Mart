/**
 * ============================================================================
 * AUTH LOGIN API - User Authentication Logging
 * ============================================================================
 * Grabify Secure Shopping Mart
 * 
 * Handles login logging and user session management.
 * Actual authentication happens via Firebase Auth on client-side.
 * This endpoint logs all login attempts for security audit.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserLoginSchema } from '@/libs/validationSchemas';
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  Timestamp,
  updateDoc 
} from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';

/**
 * Log login attempt to Firestore
 * CRITICAL: This fulfills the requirement to log all login attempts
 */
async function logLoginAttempt(
  email: string,
  userId: string | null,
  success: boolean,
  details: Record<string, unknown>
): Promise<void> {
  try {
    await addDoc(collection(db, 'logs'), {
      action: 'LOGIN_ATTEMPT',
      timestamp: Timestamp.now(),
      userId,
      details: {
        email,
        userAgent: details.userAgent || 'Unknown',
        ...details,
      },
      success,
      source: 'AUTH_API',
    });
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

/**
 * POST /api/auth/login
 * Log login attempt and return user info
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // Validate input with Zod
    const validationResult = UserLoginSchema.safeParse(body);
    
    if (!validationResult.success) {
      await logLoginAttempt(body.email || 'unknown', null, false, {
        reason: 'Validation failed',
        userAgent,
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
    
    const { email } = validationResult.data;
    
    // Check if login confirmation (after Firebase Auth success)
    const uid = request.headers.get('x-user-id');
    
    if (uid) {
      // Verify user exists in Firestore
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await logLoginAttempt(email, uid, false, {
          reason: 'User not found in database',
          userAgent,
        });
        
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      const userData = userSnap.data();
      
      // Update last login
      await updateDoc(userRef, {
        lastLoginAt: Timestamp.now(),
      });
      
      // Log successful login
      await logLoginAttempt(email, uid, true, {
        role: userData.role,
        userAgent,
      });
      
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          uid,
          email: userData.email,
          role: userData.role,
        },
      });
    }
    
    // If no UID, just acknowledge the validation passed
    return NextResponse.json({
      success: true,
      message: 'Validation passed',
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    await logLoginAttempt('unknown', null, false, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * Get current user info
 */
export async function GET(request: NextRequest) {
  try {
    const uid = request.headers.get('x-user-id');
    
    if (!uid) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const userData = userSnap.data();
    
    return NextResponse.json({
      success: true,
      user: {
        uid,
        email: userData.email,
        role: userData.role,
      },
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}

