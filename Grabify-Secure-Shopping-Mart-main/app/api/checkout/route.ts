/**
 * ============================================================================
 * CHECKOUT API ROUTE - Payment Processing & Order Creation
 * ============================================================================
 * Grabify Secure Shopping Mart
 * 
 * Handles checkout flow with:
 * - Cart validation
 * - Dummy payment simulation
 * - Order creation
 * - Stock updates via DLL
 * - Comprehensive logging
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { CheckoutSchema } from '@/libs/validationSchemas';
import { ProductDLL } from '@/libs/secureProductDLL';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';

// Server-side DLL secret
const DLL_SECRET = process.env.DLL_SECRET || '';

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Log checkout action
 */
async function logCheckoutAction(
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
      source: 'CHECKOUT_API',
    });
  } catch (error) {
    console.error('Failed to log checkout action:', error);
  }
}

/**
 * Simulate payment processing
 * In production, this would integrate with a real payment gateway
 */
function simulatePayment(paymentInfo: {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}): {
  success: boolean;
  transactionId: string;
  message: string;
} {
  // Simulate payment delay (removed for API)
  
  // Simulate success rate (95% success for demo)
  const isSuccess = Math.random() > 0.05;
  
  // Generate mock transaction ID
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Mask card number for logging
  const maskedCard = `****${paymentInfo.cardNumber.slice(-4)}`;
  
  if (isSuccess) {
    return {
      success: true,
      transactionId,
      message: `Payment approved for card ending in ${maskedCard}`,
    };
  } else {
    return {
      success: false,
      transactionId,
      message: 'Payment declined. Please try again or use a different card.',
    };
  }
}

/**
 * POST /api/checkout
 * Process checkout and create order
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      await logCheckoutAction('CHECKOUT_UNAUTHORIZED', null, {
        reason: 'No user authentication',
      }, false);
      
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // =========================================
    // STEP 1: Validate input with Zod
    // This prevents NoSQL injection attacks
    // =========================================
    const validationResult = CheckoutSchema.safeParse(body);
    
    if (!validationResult.success) {
      await logCheckoutAction('CHECKOUT_VALIDATION_FAILED', userId, {
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
    
    const { paymentInfo, shippingAddress, items, total } = validationResult.data;
    
    // =========================================
    // STEP 2: Verify products exist and have stock
    // =========================================
    const stockValidation = await Promise.all(
      items.map(async (item) => {
        const productResult = await ProductDLL.getProductById(DLL_SECRET, item.productId);
        
        if (!productResult.success || !productResult.data) {
          return { valid: false, productId: item.productId, reason: 'Product not found' };
        }
        
        if (productResult.data.stock < item.quantity) {
          return { 
            valid: false, 
            productId: item.productId, 
            reason: `Insufficient stock. Available: ${productResult.data.stock}` 
          };
        }
        
        return { valid: true, productId: item.productId, product: productResult.data };
      })
    );
    
    const invalidItems = stockValidation.filter(v => !v.valid);
    
    if (invalidItems.length > 0) {
      await logCheckoutAction('CHECKOUT_STOCK_VALIDATION_FAILED', userId, {
        invalidItems,
      }, false);
      
      return NextResponse.json(
        {
          error: 'Stock validation failed',
          details: invalidItems,
        },
        { status: 400 }
      );
    }
    
    // =========================================
    // STEP 3: Process payment (simulated)
    // =========================================
    const paymentResult = simulatePayment(paymentInfo);
    
    await logCheckoutAction('PAYMENT_PROCESSED', userId, {
      transactionId: paymentResult.transactionId,
      success: paymentResult.success,
      cardLast4: paymentInfo.cardNumber.slice(-4),
    }, paymentResult.success);
    
    if (!paymentResult.success) {
      return NextResponse.json(
        {
          error: 'Payment failed',
          message: paymentResult.message,
          transactionId: paymentResult.transactionId,
        },
        { status: 402 }
      );
    }
    
    // =========================================
    // STEP 4: Update stock using DLL
    // =========================================
    const stockUpdates = await Promise.all(
      items.map(async (item) => {
        const result = await ProductDLL.updateStock(
          DLL_SECRET,
          item.productId,
          -item.quantity, // Negative to reduce stock
          userId
        );
        
        return {
          productId: item.productId,
          success: result.success,
          newStock: result.data?.newStock,
        };
      })
    );
    
    // =========================================
    // STEP 5: Create order in Firestore
    // =========================================
    const orderId = generateOrderId();
    
    const orderData = {
      id: orderId,
      userId,
      items: items.map((item, index) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: stockValidation[index].product?.name,
      })),
      total,
      status: 'processing',
      shippingAddress,
      dummyPaymentInfo: {
        cardLast4: paymentInfo.cardNumber.slice(-4),
        cardholderName: paymentInfo.cardholderName,
        paymentMethod: 'Credit Card',
        transactionId: paymentResult.transactionId,
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    await addDoc(collection(db, 'orders'), orderData);
    
    // =========================================
    // STEP 6: Clear user's cart
    // =========================================
    const cartQuery = query(
      collection(db, 'cart'),
      where('userId', '==', userId)
    );
    const cartSnapshot = await getDocs(cartQuery);
    
    await Promise.all(
      cartSnapshot.docs.map(doc => deleteDoc(doc.ref))
    );
    
    // =========================================
    // STEP 7: Log successful checkout
    // =========================================
    const processingTime = Date.now() - startTime;
    
    await logCheckoutAction('CHECKOUT_SUCCESS', userId, {
      orderId,
      total,
      itemCount: items.length,
      transactionId: paymentResult.transactionId,
      processingTime: `${processingTime}ms`,
    }, true);
    
    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        total,
        status: 'processing',
        transactionId: paymentResult.transactionId,
        estimatedDelivery: orderData.estimatedDelivery,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Checkout error:', error);
    
    await logCheckoutAction('CHECKOUT_ERROR', null, {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, false);
    
    return NextResponse.json(
      { error: 'Checkout failed. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout/orders
 * Get user's order history
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
    
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    const orders = ordersSnapshot.docs.map(doc => ({
      ...doc.data(),
      docId: doc.id,
    }));
    
    // Sort by timestamp descending
    orders.sort((a, b) => {
      const aTime = a.timestamp?.toMillis?.() || 0;
      const bTime = b.timestamp?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    return NextResponse.json({
      success: true,
      orders,
    });
    
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

