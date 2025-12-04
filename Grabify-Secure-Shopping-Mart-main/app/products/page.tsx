'use client';

/**
 * ============================================================================
 * PRODUCTS PAGE - Light Theme
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Loader2, ShoppingBag, Database, Plus, ChevronDown, X, Laptop, Shirt, Home, Dumbbell, BookOpen, Grid3X3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { AuthProvider, useAuth } from '@/store/authContext';
import { Product } from '@/store/useStore';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';
import toast from 'react-hot-toast';
import Link from 'next/link';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Sports & Fitness',
  'Books & Stationery',
];

const CATEGORY_DATA = [
  { name: 'Electronics', icon: Laptop, color: 'cyan', gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Clothing', icon: Shirt, color: 'purple', gradient: 'from-purple-500 to-pink-600' },
  { name: 'Home & Kitchen', icon: Home, color: 'amber', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Sports & Fitness', icon: Dumbbell, color: 'green', gradient: 'from-green-500 to-emerald-600' },
  { name: 'Books & Stationery', icon: BookOpen, color: 'pink', gradient: 'from-pink-500 to-rose-600' },
];

const MemoizedProductCard = memo(ProductCard);

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name');
  const [seeding, setSeeding] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const { isAdmin, userData } = useAuth();

  // Read category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSeedProducts = async () => {
    if (!isAdmin) {
      toast.error('Only admins can seed products');
      return;
    }

    setSeeding(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData?.uid }),
      });
      
      if (response.ok) {
        toast.success('Products seeded successfully!');
        await fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to seed products');
      }
    } catch (error) {
      console.error('Error seeding products:', error);
      toast.error('Failed to seed products');
    } finally {
      setSeeding(false);
    }
  };

  const handleAddItemToCategory = (category: string) => {
    setShowAddItemModal(false);
    router.push(`/admin?category=${encodeURIComponent(category)}`);
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(query) || 
             p.description.toLowerCase().includes(query) ||
             p.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              <span className="text-gray-800">Our </span>
              <span className="cyber-heading">Products</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Browse our collection of amazing products with secure checkout
            </p>
          </motion.div>

          {/* Filters & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input pl-12 pr-4 py-3 rounded-xl w-full"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="glass-input px-4 py-3 rounded-xl w-full lg:w-48 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 truncate">{selectedCategory}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {categoryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      {CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center group hover:bg-cyan-50 transition-colors">
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setCategoryDropdownOpen(false);
                            }}
                            className={`flex-1 text-left px-4 py-3 transition-colors ${
                              selectedCategory === category 
                                ? 'bg-gradient-to-r from-cyan-50 to-purple-50 text-cyan-600 font-semibold' 
                                : 'text-gray-600'
                            }`}
                          >
                            {category}
                          </button>
                          
                          {/* Add Item Button in Dropdown - Only for Admins */}
                          {isAdmin && category !== 'All Categories' && (
                            <Link 
                              href={`/admin?category=${encodeURIComponent(category)}`}
                              onClick={() => setCategoryDropdownOpen(false)}
                              className="pr-3"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:shadow-lg"
                                title={`Add item to ${category}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </motion.div>
                            </Link>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input px-4 py-3 rounded-xl w-full lg:w-44 appearance-none cursor-pointer"
                title="Sort products"
                aria-label="Sort products"
              >
                <option value="name">Sort by Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {/* Admin Buttons */}
              {isAdmin && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSeedProducts}
                    disabled={seeding}
                    className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                  >
                    {seeding ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Database className="w-5 h-5" />
                    )}
                    Seed Data
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddItemModal(true)}
                    className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Item
                  </motion.button>
                  
                  <Link href="/admin">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 transition-all"
                    >
                      <Grid3X3 className="w-5 h-5" />
                      Manage
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Category Pills with Add Item Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center gap-1 group">
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
                
                {/* Add Item Button - Only for Admins and not for "All Categories" */}
                {isAdmin && category !== 'All Categories' && (
                  <Link href={`/admin?category=${encodeURIComponent(category)}`}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:shadow-lg"
                      title={`Add item to ${category}`}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </Link>
                )}
              </div>
            ))}
          </motion.div>

          {/* Results Count with Add Item Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3"
          >
            <span className="text-gray-500">
              Showing <span className="font-semibold text-cyan-600">{filteredProducts.length}</span> products
            </span>
            {selectedCategory !== 'All Categories' && (
              <>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                  {selectedCategory}
                </span>
                
                {/* Add Item Button for Selected Category - Only for Admins */}
                {isAdmin && (
                  <Link href={`/admin?category=${encodeURIComponent(selectedCategory)}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex items-center gap-1 shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to {selectedCategory}
                    </motion.button>
                  </Link>
                )}
              </>
            )}
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card rounded-3xl overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <MemoizedProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 glass-card rounded-3xl"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">No Products Found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? `No products match "${searchQuery}"`
                  : selectedCategory !== 'All Categories'
                    ? `No products in ${selectedCategory}`
                    : 'No products available yet'}
              </p>
              
              {isAdmin && (
                <div className="flex flex-wrap justify-center gap-3">
                  {/* Add Item to Category Button - Show when category is selected */}
                  {selectedCategory !== 'All Categories' && (
                    <Link href={`/admin?category=${encodeURIComponent(selectedCategory)}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md inline-flex items-center gap-2 hover:shadow-lg transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Add to {selectedCategory}
                      </motion.button>
                    </Link>
                  )}
                  
                  {/* Seed Products Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSeedProducts}
                    disabled={seeding}
                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md inline-flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {seeding ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Database className="w-5 h-5" />
                    )}
                    Seed Sample Products
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItemModal && isAdmin && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddItemModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Plus className="w-6 h-6" />
                    Add Item to Category
                  </h2>
                  <button
                    onClick={() => setShowAddItemModal(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    Select a category to add a new product to:
                  </p>
                  
                  {/* Category Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CATEGORY_DATA.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <motion.button
                          key={category.name}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddItemToCategory(category.name)}
                          className={`relative p-6 rounded-xl bg-gradient-to-br ${category.gradient} text-white shadow-lg hover:shadow-xl transition-all group overflow-hidden`}
                        >
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
                          </div>
                          
                          {/* Content */}
                          <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                              <IconComponent className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                            <p className="text-white/80 text-sm flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Add new product
                            </p>
                          </div>
                          
                          {/* Hover Effect */}
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-xl" />
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">Quick Actions:</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/admin">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowAddItemModal(false)}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <Grid3X3 className="w-4 h-4 inline mr-2" />
                          Manage All Products
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowAddItemModal(false);
                          handleSeedProducts();
                        }}
                        disabled={seeding}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-50"
                      >
                        {seeding ? (
                          <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                        ) : (
                          <Database className="w-4 h-4 inline mr-2" />
                        )}
                        Seed Sample Products
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p className="mb-2 font-medium">© 2024 Grabify - Secure Shopping Mart</p>
          <p className="text-sm">
            Built with Next.js, Firebase, and ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AuthProvider>
      <ProductsContent />
    </AuthProvider>
  );
}
