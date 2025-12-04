/**
 * ============================================================================
 * ZOD VALIDATION SCHEMAS - NoSQL Injection Prevention
 * ============================================================================
 * Grabify Secure Shopping Mart
 * 
 * These schemas provide input validation equivalent to SQL Injection prevention
 * in traditional database applications. Zod ensures that:
 * 
 * 1. All inputs are strictly typed
 * 2. Malicious patterns are rejected
 * 3. Data is sanitized before database operations
 * ============================================================================
 */

import { z } from 'zod';

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const UserRegistrationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email too short')
    .max(100, 'Email too long')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const UserLoginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required'),
});

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const ProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(100, 'Product name too long')
    .regex(/^[a-zA-Z0-9\s\-\_\.\,\!\'\&]+$/, 'Invalid characters in product name'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description too long'),
  price: z.coerce.number()
    .positive('Price must be positive')
    .max(999999, 'Price exceeds maximum'),
  stock: z.coerce.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(99999, 'Stock exceeds maximum'),
  imageUrl: z.string().optional(),
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category name too long'),
});

export const ProductUpdateSchema = ProductSchema.partial();

// ============================================================================
// CART SCHEMAS
// ============================================================================

export const CartItemSchema = z.object({
  productId: z.string()
    .min(1, 'Product ID is required')
    .max(100, 'Invalid product ID'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(99, 'Maximum quantity exceeded'),
});

export const CartUpdateSchema = z.object({
  items: z.array(CartItemSchema),
});

// ============================================================================
// CHECKOUT / PAYMENT SCHEMAS
// ============================================================================

export const PaymentInfoSchema = z.object({
  cardNumber: z.string()
    .regex(/^\d{16}$/, 'Card number must be 16 digits')
    .transform(val => val.replace(/\s/g, '')),
  expiryMonth: z.string()
    .regex(/^(0[1-9]|1[0-2])$/, 'Invalid expiry month'),
  expiryYear: z.string()
    .regex(/^\d{2}$/, 'Invalid expiry year'),
  cvv: z.string()
    .regex(/^\d{3,4}$/, 'CVV must be 3-4 digits'),
  cardholderName: z.string()
    .min(2, 'Cardholder name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-\.]+$/, 'Invalid characters in name'),
});

export const ShippingAddressSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name is required')
    .max(100, 'Name too long'),
  address: z.string()
    .min(5, 'Address is required')
    .max(200, 'Address too long'),
  city: z.string()
    .min(2, 'City is required')
    .max(100, 'City name too long'),
  state: z.string()
    .min(2, 'State is required')
    .max(100, 'State name too long'),
  zipCode: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string()
    .min(2, 'Country is required')
    .max(100, 'Country name too long'),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]{10,20}$/, 'Invalid phone number'),
});

export const CheckoutSchema = z.object({
  paymentInfo: PaymentInfoSchema,
  shippingAddress: ShippingAddressSchema,
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, 'Cart is empty'),
  total: z.number().positive('Total must be positive'),
});

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const OrderStatusSchema = z.enum([
  'pending',
  'processing', 
  'shipped',
  'delivered',
  'cancelled'
]);

export const OrderUpdateSchema = z.object({
  status: OrderStatusSchema,
});

// ============================================================================
// SEARCH & FILTER SCHEMAS
// ============================================================================

export const SearchQuerySchema = z.object({
  query: z.string()
    .max(100, 'Search query too long')
    .optional(),
  category: z.string()
    .max(50, 'Category name too long')
    .optional(),
  minPrice: z.number()
    .min(0, 'Minimum price cannot be negative')
    .optional(),
  maxPrice: z.number()
    .max(999999, 'Maximum price exceeded')
    .optional(),
  sortBy: z.enum(['price', 'name', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

// ============================================================================
// LOGGING SCHEMAS
// ============================================================================

export const LogEntrySchema = z.object({
  action: z.string().max(100),
  userId: z.string().max(100).nullable(),
  details: z.record(z.unknown()),
  success: z.boolean(),
});

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type PaymentInfo = z.infer<typeof PaymentInfoSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type Checkout = z.infer<typeof CheckoutSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate data against a schema and return result
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Sanitize string input to prevent injection
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove JS protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

