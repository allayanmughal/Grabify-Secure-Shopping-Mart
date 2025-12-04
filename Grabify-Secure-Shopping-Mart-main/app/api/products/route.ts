/**
 * ============================================================================
 * PRODUCTS API ROUTE - ADMIN PROTECTED
 * ============================================================================
 * Grabify Secure Shopping Mart
 * 
 * This API route handles all product CRUD operations.
 * It uses the Password-Protected DLL (secureProductDLL) for all operations.
 * 
 * SECURITY FEATURES:
 * - Admin authentication required for write operations
 * - DLL password injected server-side (never exposed to client)
 * - All operations logged for audit trail
 * - Zod validation for input sanitization
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProductDLL } from '@/libs/secureProductDLL';
import { ProductSchema } from '@/libs/validationSchemas';
import { 
  collection, 
  getDocs, 
  addDoc, 
  Timestamp,
  query,
  where,
  doc,
  getDoc 
} from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';

// Server-side DLL secret - NEVER exposed to client
const DLL_SECRET = process.env.DLL_SECRET || '';

/**
 * Helper: Verify admin role from Firebase token
 */
async function verifyAdminRole(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return false;
    }
    
    return userSnap.data()?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Helper: Log API access
 */
async function logApiAccess(
  action: string,
  userId: string | null,
  details: Record<string, unknown>,
  success: boolean
): Promise<void> {
  try {
    await addDoc(collection(db, 'logs'), {
      action,
      timestamp: Timestamp.now(),
      userId,
      details,
      success,
      source: 'PRODUCTS_API',
    });
  } catch (error) {
    console.error('Failed to log API access:', error);
  }
}

/**
 * GET /api/products
 * Fetch all products or filter by category
 * PUBLIC ACCESS - Anyone can view products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const productId = searchParams.get('id');
    
    // If specific product ID is requested
    if (productId) {
      const result = await ProductDLL.getProductById(DLL_SECRET, productId);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        product: result.data,
      });
    }
    
    // If filtering by category
    if (category) {
      const result = await ProductDLL.getProductsByCategory(DLL_SECRET, category);
      
      return NextResponse.json({
        success: true,
        products: result.data || [],
      });
    }
    
    // Fetch all products
    const result = await ProductDLL.getAllProducts(DLL_SECRET);
    
    return NextResponse.json({
      success: true,
      products: result.data || [],
    });
    
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 * ADMIN ONLY - Requires authentication and admin role
 * Uses Password-Protected DLL for database operations
 */
export async function POST(request: NextRequest) {
  try {
    // Extract user ID from request headers (set by auth middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      await logApiAccess('CREATE_PRODUCT_UNAUTHORIZED', null, {
        reason: 'No user ID provided',
      }, false);
      
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify admin role
    const isAdmin = await verifyAdminRole(userId);
    
    if (!isAdmin) {
      await logApiAccess('CREATE_PRODUCT_FORBIDDEN', userId, {
        reason: 'User is not an admin',
      }, false);
      
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate input with Zod (NoSQL Injection Prevention)
    const validationResult = ProductSchema.safeParse(body);
    
    if (!validationResult.success) {
      await logApiAccess('CREATE_PRODUCT_VALIDATION_FAILED', userId, {
        errors: validationResult.error.errors,
      }, false);
      
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
    
    // =========================================
    // CRITICAL: Call Password-Protected DLL
    // The DLL_SECRET is injected server-side
    // =========================================
    const result = await ProductDLL.insertProduct(
      DLL_SECRET,  // Server-side DLL password
      validationResult.data,
      userId
    );
    
    if (!result.success) {
      await logApiAccess('CREATE_PRODUCT_FAILED', userId, {
        error: result.error,
        operationId: result.operationId,
      }, false);
      
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    // Log successful creation
    await logApiAccess('CREATE_PRODUCT_SUCCESS', userId, {
      productId: result.data?.id,
      productName: validationResult.data.name,
      operationId: result.operationId,
    }, true);
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: result.data,
      operationId: result.operationId,
    }, { status: 201 });
    
  } catch (error) {
    console.error('POST /api/products error:', error);
    
    await logApiAccess('CREATE_PRODUCT_ERROR', null, {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, false);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products
 * Update an existing product
 * ADMIN ONLY - Requires authentication and admin role
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const isAdmin = await verifyAdminRole(userId);
    
    if (!isAdmin) {
      await logApiAccess('UPDATE_PRODUCT_FORBIDDEN', userId, {
        reason: 'User is not an admin',
      }, false);
      
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Call Password-Protected DLL
    const result = await ProductDLL.updateProduct(
      DLL_SECRET,
      id,
      updateData,
      userId
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    await logApiAccess('UPDATE_PRODUCT_SUCCESS', userId, {
      productId: id,
      updatedFields: Object.keys(updateData),
      operationId: result.operationId,
    }, true);
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: result.data,
    });
    
  } catch (error) {
    console.error('PUT /api/products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products
 * Delete a product
 * ADMIN ONLY - Requires authentication and admin role
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const isAdmin = await verifyAdminRole(userId);
    
    if (!isAdmin) {
      await logApiAccess('DELETE_PRODUCT_FORBIDDEN', userId, {
        reason: 'User is not an admin',
      }, false);
      
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Call Password-Protected DLL
    const result = await ProductDLL.deleteProduct(
      DLL_SECRET,
      productId,
      userId
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    await logApiAccess('DELETE_PRODUCT_SUCCESS', userId, {
      productId,
      operationId: result.operationId,
    }, true);
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
    
  } catch (error) {
    console.error('DELETE /api/products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

