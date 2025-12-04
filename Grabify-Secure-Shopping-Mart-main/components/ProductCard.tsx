'use client';

/**
 * ============================================================================
 * PRODUCT CARD COMPONENT - Light Theme
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { useState, memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Star } from 'lucide-react';
import { useStore, Product } from '@/store/useStore';
import { useAuth } from '@/store/authContext';
import { getProductImageUrl } from '@/libs/imageUtils';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = memo(function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, setCartOpen } = useStore();
  const { userData } = useAuth();

  const handleAddToCart = () => {
    if (!userData) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    
    if (product.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }
    
    addToCart(product, quantity);
    setCartOpen(true);
    toast.success(`${product.name} added to cart!`);
    setQuantity(1);
  };

  // Get image URL with category-based fallback
  const imageUrl = getProductImageUrl(product.imageUrl, product.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className="group"
    >
      <div className="glass-card rounded-3xl overflow-hidden hover:shadow-large transition-all duration-300 hover:-translate-y-2">
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-cyan-600 shadow-soft">
              {product.category}
            </span>
          </div>
          
          {/* Stock Badge */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">
                Only {product.stock} left
              </span>
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                Out of Stock
              </span>
            </div>
          )}

          {/* Product Image */}
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-white">
          {/* Title & Rating */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-cyan-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                />
              ))}
              <span className="text-xs text-gray-400 ml-2">(4.0)</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-500 text-sm line-clamp-2">
            {product.description}
          </p>

          {/* Price & Quantity */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Price</p>
              <p className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              
              <span className="w-8 text-center font-bold text-gray-800">{quantity}</span>
              
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
