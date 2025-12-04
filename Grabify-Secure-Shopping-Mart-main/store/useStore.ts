/**
 * ============================================================================
 * ZUSTAND STORE - Global State Management
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    productName?: string;
  }>;
  total: number;
  status: string;
  timestamp: string;
  dummyPaymentInfo?: {
    cardLast4: string;
    paymentMethod: string;
    transactionId: string;
  };
}

// Store State
interface StoreState {
  // User
  user: User | null;
  isLoading: boolean;
  
  // Cart
  cart: CartItem[];
  cartOpen: boolean;
  
  // Products
  products: Product[];
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  setCart: (items: CartItem[]) => void;
  
  // Product Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  
  // Computed
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isLoading: true,
      cart: [],
      cartOpen: false,
      products: [],
      
      // User Actions
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      
      // Cart Actions
      addToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.productId === product.id);
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            cart: [
              ...cart,
              {
                id: `cart-${product.id}-${Date.now()}`,
                productId: product.id,
                quantity,
                product,
              },
            ],
          });
        }
      },
      
      removeFromCart: (productId) => {
        set({
          cart: get().cart.filter(item => item.productId !== productId),
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        set({
          cart: get().cart.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          ),
        });
      },
      
      clearCart: () => set({ cart: [] }),
      
      setCartOpen: (open) => set({ cartOpen: open }),
      
      setCart: (items) => set({ cart: items }),
      
      // Product Actions
      setProducts: (products) => set({ products }),
      
      addProduct: (product) => {
        set({ products: [...get().products, product] });
      },
      
      updateProduct: (productId, updates) => {
        set({
          products: get().products.map(p =>
            p.id === productId ? { ...p, ...updates } : p
          ),
        });
      },
      
      deleteProduct: (productId) => {
        set({
          products: get().products.filter(p => p.id !== productId),
        });
      },
      
      // Computed Values
      getCartTotal: () => {
        return get().cart.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      
      getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'grabify-store',
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

