/**
 * ============================================================================
 * CART API ROUTE
 * ============================================================================
 * Grabify Secure Shopping Mart
 * 
 * Handles shopping cart operations:
 * - Add items to cart
 * - Update quantities
 * - Remove items
 * - Get cart contents
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { CartItemSchema } from '@/libs/validationSchemas';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';

/**
 * GET /api/cart
 * Get user's cart contents
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const cartQuery = query(
      collection(db, 'cart'),
      where('userId', '==', userId)
    );
    
    const cartSnapshot = await getDocs(cartQuery);
    
    // Get product details for each cart item
    const cartItems = await Promise.all(
      cartSnapshot.docs.map(async (cartDoc) => {
        const cartData = cartDoc.data();
        const productRef = doc(db, 'products', cartData.productId);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
          return null;
        }
        
        const productData = productSnap.data();
        
        return {
          id: cartDoc.id,
          productId: cartData.productId,
          quantity: cartData.quantity,
          product: {
            id: productSnap.id,
            name: productData.name,
            price: productData.price,
            imageUrl: productData.imageUrl,
            stock: productData.stock,
          },
        };
      })
    );
    
    // Filter out null items (products that no longer exist)
    const validItems = cartItems.filter(item => item !== null);
    
    // Calculate totals
    const subtotal = validItems.reduce((sum, item) => {
      return sum + (item!.product.price * item!.quantity);
    }, 0);
    
    return NextResponse.json({
      success: true,
      cart: {
        items: validItems,
        itemCount: validItems.length,
        subtotal: Math.round(subtotal * 100) / 100,
      },
    });
    
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const validationResult = CartItemSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { productId, quantity } = validationResult.data;
    
    // Verify product exists and has stock
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    const productData = productSnap.data();
    
    if (productData.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }
    
    // Check if item already in cart
    const existingQuery = query(
      collection(db, 'cart'),
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Update existing cart item
      const existingDoc = existingSnapshot.docs[0];
      const existingQuantity = existingDoc.data().quantity;
      const newQuantity = existingQuantity + quantity;
      
      if (newQuantity > productData.stock) {
        return NextResponse.json(
          { error: 'Cannot add more items than available stock' },
          { status: 400 }
        );
      }
      
      await updateDoc(existingDoc.ref, {
        quantity: newQuantity,
        updatedAt: Timestamp.now(),
      });
      
      return NextResponse.json({
        success: true,
        message: 'Cart updated',
        item: {
          id: existingDoc.id,
          productId,
          quantity: newQuantity,
        },
      });
    }
    
    // Add new cart item
    const cartRef = await addDoc(collection(db, 'cart'), {
      userId,
      productId,
      quantity,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      item: {
        id: cartRef.id,
        productId,
        quantity,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart
 * Update cart item quantity
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
    
    const body = await request.json();
    const { cartItemId, quantity } = body;
    
    if (!cartItemId || typeof quantity !== 'number') {
      return NextResponse.json(
        { error: 'Cart item ID and quantity are required' },
        { status: 400 }
      );
    }
    
    const cartRef = doc(db, 'cart', cartItemId);
    const cartSnap = await getDoc(cartRef);
    
    if (!cartSnap.exists()) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    const cartData = cartSnap.data();
    
    // Verify ownership
    if (cartData.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // If quantity is 0 or less, delete the item
    if (quantity <= 0) {
      await deleteDoc(cartRef);
      
      return NextResponse.json({
        success: true,
        message: 'Item removed from cart',
      });
    }
    
    // Verify stock
    const productRef = doc(db, 'products', cartData.productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      await deleteDoc(cartRef);
      return NextResponse.json(
        { error: 'Product no longer available' },
        { status: 404 }
      );
    }
    
    if (productSnap.data().stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }
    
    await updateDoc(cartRef, {
      quantity,
      updatedAt: Timestamp.now(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Cart updated',
      item: {
        id: cartItemId,
        quantity,
      },
    });
    
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Remove item from cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // If no ID, clear entire cart
    if (!cartItemId) {
      const cartQuery = query(
        collection(db, 'cart'),
        where('userId', '==', userId)
      );
      
      const cartSnapshot = await getDocs(cartQuery);
      
      await Promise.all(
        cartSnapshot.docs.map(doc => deleteDoc(doc.ref))
      );
      
      return NextResponse.json({
        success: true,
        message: 'Cart cleared',
      });
    }
    
    // Delete specific item
    const cartRef = doc(db, 'cart', cartItemId);
    const cartSnap = await getDoc(cartRef);
    
    if (!cartSnap.exists()) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (cartSnap.data().userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await deleteDoc(cartRef);
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
    
  } catch (error) {
    console.error('Delete cart error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}

