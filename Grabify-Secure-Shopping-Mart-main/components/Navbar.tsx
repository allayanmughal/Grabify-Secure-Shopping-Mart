'use client';

/**
 * ============================================================================
 * NAVBAR COMPONENT - Light Theme with Glass Effect
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut,
  Settings,
  Package,
  FileText,
  ChevronDown,
  Plus,
  Laptop,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
  Grid3X3
} from 'lucide-react';
import { useAuth } from '@/store/authContext';
import { useStore } from '@/store/useStore';
import CartSidebar from './CartSidebar';

const CATEGORIES = [
  { name: 'Electronics', icon: Laptop, color: 'cyan' },
  { name: 'Clothing', icon: Shirt, color: 'purple' },
  { name: 'Home & Kitchen', icon: Home, color: 'amber' },
  { name: 'Sports & Fitness', icon: Dumbbell, color: 'green' },
  { name: 'Books & Stationery', icon: BookOpen, color: 'pink' },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { userData, signOut, isAdmin } = useAuth();
  const { getCartItemCount, setCartOpen, cartOpen } = useStore();
  
  const cartCount = getCartItemCount();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    router.push('/');
  };

  const handleNavigation = (href: string) => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
    setMobileCategoriesOpen(false);
    router.push(href);
  };

  const handleCategoryClick = (category: string) => {
    setCategoriesOpen(false);
    setMobileCategoriesOpen(false);
    setMobileMenuOpen(false);
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleAddItem = (category: string) => {
    setCategoriesOpen(false);
    setMobileCategoriesOpen(false);
    setMobileMenuOpen(false);
    router.push(`/admin?category=${encodeURIComponent(category)}`);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="navbar-glass mx-2 sm:mx-4 mt-2 sm:mt-4 rounded-xl sm:rounded-2xl shadow-soft">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow-cyan"
                >
                  <span className="text-white font-bold text-lg sm:text-xl">G</span>
                </motion.div>
                <span className="text-xl sm:text-2xl font-extrabold cyber-heading hidden xs:block">
                  Grabify
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-6 xl:gap-8">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavigation(link.href)}
                    className="relative text-gray-600 hover:text-cyan-600 transition-colors font-medium group"
                  >
                    <span>{link.label}</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:w-full transition-all duration-300 rounded-full" />
                  </button>
                ))}

                {/* Categories Dropdown */}
                <div className="relative" ref={categoriesRef}>
                  <button
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    className="relative flex items-center gap-1.5 text-gray-600 hover:text-cyan-600 transition-colors font-medium group"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span>Categories</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:w-full transition-all duration-300 rounded-full" />
                  </button>
                  
                  {/* Categories Dropdown Menu */}
                  <AnimatePresence>
                    {categoriesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-4 w-72 rounded-2xl shadow-2xl bg-white border border-gray-100 z-[100]"
                        style={{ top: '100%' }}
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-t-2xl">
                          <p className="text-gray-800 font-bold flex items-center gap-2">
                            <Grid3X3 className="w-5 h-5 text-cyan-600" />
                            Browse Categories
                          </p>
                        </div>
                        
                        {/* Category Items */}
                        <div className="p-2 max-h-80 overflow-y-auto">
                          {/* All Products */}
                          <button
                            onClick={() => handleNavigation('/products')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center group-hover:from-cyan-200 group-hover:to-purple-200 transition-colors">
                              <Package className="w-5 h-5 text-cyan-600" />
                            </div>
                            <span className="font-medium flex-1 text-left">All Products</span>
                          </button>
                          
                          <div className="h-px bg-gray-100 my-2" />
                          
                          {CATEGORIES.map((category) => {
                            const IconComponent = category.icon;
                            return (
                              <div key={category.name} className="group">
                                <div className="flex items-center gap-2 px-2 py-1">
                                  <button
                                    onClick={() => handleCategoryClick(category.name)}
                                    className="flex-1 flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
                                  >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${category.color}-100 to-${category.color}-200 flex items-center justify-center`}>
                                      <IconComponent className={`w-5 h-5 text-${category.color}-600`} />
                                    </div>
                                    <span className="font-medium text-left">{category.name}</span>
                                  </button>
                                  
                                  {/* Add Item Button - Only for Admins */}
                                  {isAdmin && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleAddItem(category.name)}
                                      className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:shadow-lg"
                                      title={`Add item to ${category.name}`}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Footer - Add New Product */}
                        {isAdmin && (
                          <div className="p-2 border-t border-gray-100 bg-gradient-to-r from-cyan-50/50 to-purple-50/50 rounded-b-2xl">
                            <button
                              onClick={() => handleNavigation('/admin')}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl hover:shadow-lg transition-all"
                            >
                              <Plus className="w-5 h-5" />
                              <span>Add New Product</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                {/* Cart Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCartOpen(true)}
                  className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-[10px] sm:text-xs flex items-center justify-center font-bold shadow-md"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* User Menu */}
                {userData ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 px-2 sm:px-3 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-sm">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-xs sm:text-sm text-gray-800 font-semibold max-w-[80px] sm:max-w-[100px] truncate">
                          {userData.email.split('@')[0]}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{isAdmin ? 'Admin' : 'Customer'}</p>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-4 w-64 rounded-2xl shadow-2xl bg-white border border-gray-100 z-[100]"
                          style={{ top: '100%' }}
                        >
                          {/* User Info Header */}
                          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-t-2xl">
                            <p className="text-gray-800 font-semibold truncate">{userData.email}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {isAdmin ? '👑 Administrator' : '🛒 Customer'}
                            </p>
                          </div>
                          
                          {/* Menu Items */}
                          <div className="p-2">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    setUserMenuOpen(false);
                                    setTimeout(() => setShowAddItemModal(true), 100);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                                >
                                  <Plus className="w-5 h-5" />
                                  <span className="font-medium">Add Item</span>
                                </button>
                                <button
                                  onClick={() => handleNavigation('/admin')}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
                                >
                                  <Settings className="w-5 h-5" />
                                  <span className="font-medium">Admin Panel</span>
                                </button>
                                <button
                                  onClick={() => handleNavigation('/admin/logs')}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                                >
                                  <FileText className="w-5 h-5" />
                                  <span className="font-medium">Security Logs</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleNavigation('/orders')}
                              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                            >
                              <Package className="w-5 h-5" />
                              <span className="font-medium">My Orders</span>
                            </button>
                          </div>
                          
                          {/* Logout Button */}
                          <div className="p-2 border-t border-gray-100 bg-red-50/50 rounded-b-2xl">
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-xl transition-colors font-semibold"
                            >
                              <LogOut className="w-5 h-5" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleNavigation('/login')}
                      className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-cyan-600 transition-colors font-medium"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleNavigation('/register')}
                      className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-glow-cyan transition-all"
                    >
                      Get Started
                    </button>
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  ) : (
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-2 sm:mx-4 mt-2 rounded-xl sm:rounded-2xl lg:hidden bg-white shadow-2xl border border-gray-100"
              style={{ overflow: 'visible' }}
            >
              <div className="p-3 sm:p-4 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavigation(link.href)}
                    className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    {link.label}
                  </button>
                ))}

                {/* Mobile Categories Dropdown */}
                <div className="border-t border-gray-100 my-2 sm:my-3 pt-2 sm:pt-3">
                  <button
                    onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Categories</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {mobileCategoriesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-3 sm:pl-4 mt-1 sm:mt-2 space-y-1">
                          {/* All Products */}
                          <button
                            onClick={() => handleNavigation('/products')}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg sm:rounded-xl transition-colors text-sm"
                          >
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                            <span className="font-medium">All Products</span>
                          </button>

                          {CATEGORIES.map((category) => {
                            const IconComponent = category.icon;
                            return (
                              <div key={category.name} className="flex items-center gap-1 sm:gap-2">
                                <button
                                  onClick={() => handleCategoryClick(category.name)}
                                  className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg sm:rounded-xl transition-colors text-sm"
                                >
                                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span className="font-medium">{category.name}</span>
                                </button>
                                
                                {/* Add Item Button - Only for Admins */}
                                {isAdmin && (
                                  <button
                                    onClick={() => handleAddItem(category.name)}
                                    className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg transition-all"
                                    title={`Add item to ${category.name}`}
                                  >
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {userData && (
                  <>
                    <div className="border-t border-gray-100 my-2 sm:my-3" />
                    
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setTimeout(() => setShowAddItemModal(true), 100);
                          }}
                          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 transition-all font-medium text-sm sm:text-base shadow-md"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          Add Item
                        </button>
                        <button
                          onClick={() => handleNavigation('/admin')}
                          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-cyan-600 hover:bg-cyan-50 transition-colors font-medium text-sm sm:text-base"
                        >
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                          Admin Panel
                        </button>
                        <button
                          onClick={() => handleNavigation('/admin/logs')}
                          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-purple-600 hover:bg-purple-50 transition-colors font-medium text-sm sm:text-base"
                        >
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                          Security Logs
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleNavigation('/orders')}
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                    >
                      <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                      My Orders
                    </button>
                    
                    <div className="border-t border-gray-100 my-2 sm:my-3" />
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-red-500 hover:bg-red-50 transition-colors font-semibold text-sm sm:text-base"
                    >
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Add Item Modal - User Panel */}
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
                    {CATEGORIES.map((category) => {
                      const IconComponent = category.icon;
                      const gradientMap: Record<string, string> = {
                        'cyan': 'from-cyan-500 to-blue-600',
                        'purple': 'from-purple-500 to-pink-600',
                        'amber': 'from-amber-500 to-orange-600',
                        'green': 'from-green-500 to-emerald-600',
                        'pink': 'from-pink-500 to-rose-600',
                      };
                      return (
                        <motion.button
                          key={category.name}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowAddItemModal(false);
                            handleAddItem(category.name);
                          }}
                          className={`relative p-6 rounded-xl bg-gradient-to-br ${gradientMap[category.color] || 'from-gray-500 to-gray-600'} text-white shadow-lg hover:shadow-xl transition-all group overflow-hidden`}
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
                      <button
                        onClick={() => {
                          setShowAddItemModal(false);
                          handleNavigation('/admin');
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Grid3X3 className="w-4 h-4 inline mr-2" />
                        Manage All Products
                      </button>
                      <button
                        onClick={() => {
                          setShowAddItemModal(false);
                          handleNavigation('/products');
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors"
                      >
                        <Package className="w-4 h-4 inline mr-2" />
                        View Products
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
