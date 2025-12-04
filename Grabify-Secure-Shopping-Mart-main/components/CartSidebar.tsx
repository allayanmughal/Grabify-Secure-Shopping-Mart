'use client';

/**
 * ============================================================================
 * CART SIDEBAR - Light Theme
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getProductImageUrl } from '@/libs/imageUtils';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useStore();
  const total = getCartTotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-white shadow-2xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
                      <p className="text-sm text-gray-500">{cart.length} items</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Your cart is empty</h3>
                    <p className="text-gray-500 mb-6">
                      Looks like you haven&apos;t added anything yet
                    </p>
                    <Link href="/products" onClick={onClose}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md"
                      >
                        Start Shopping
                      </motion.button>
                    </Link>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0 shadow-sm">
                            <Image
                              src={getProductImageUrl(item.product.imageUrl, item.product.category)}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              {item.product.category}
                            </p>
                            <p className="text-cyan-600 font-bold mt-1">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.productId)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 self-start transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                          <span className="text-sm text-gray-500 font-medium">Quantity</span>
                          <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </motion.button>
                            
                            <span className="w-8 text-center font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-medium">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                      <span className="text-gray-800">Total</span>
                      <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Link href="/checkout" onClick={onClose}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                      >
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearCart}
                      className="w-full py-3 rounded-xl font-semibold bg-white hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200"
                    >
                      Clear Cart
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
