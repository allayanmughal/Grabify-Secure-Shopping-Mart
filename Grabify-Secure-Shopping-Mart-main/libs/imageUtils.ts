/**
 * ============================================================================
 * IMAGE UTILITIES - Default Images by Category
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

// Default image URLs by category
const DEFAULT_IMAGES: Record<string, string> = {
  'Electronics': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  'Clothing': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
  'Sports & Fitness': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
  'Books & Stationery': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
};

/**
 * Get default image URL based on category
 */
export function getDefaultImageUrl(category?: string): string {
  if (!category) {
    return DEFAULT_IMAGES['Electronics'];
  }
  return DEFAULT_IMAGES[category] || DEFAULT_IMAGES['Electronics'];
}

/**
 * Get product image URL with fallback to category default
 */
export function getProductImageUrl(imageUrl?: string, category?: string): string {
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  return getDefaultImageUrl(category);
}

