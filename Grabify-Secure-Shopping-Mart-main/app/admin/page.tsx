'use client';

/**
 * ============================================================================
 * ADMIN DASHBOARD - Light Theme
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  Save,
  X,
  Shield,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/store/authContext';
import { Product } from '@/store/useStore';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';
import toast from 'react-hot-toast';
import Link from 'next/link';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Sports & Fitness',
  'Books & Stationery',
];

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Electronics',
    imageUrl: '',
  });

  // Check for category from URL params and auto-open form
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && CATEGORIES.includes(categoryParam) && isAdmin) {
      setFormData(prev => ({ ...prev, category: categoryParam }));
      setShowForm(true);
    }
  }, [searchParams, isAdmin]);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push('/login');
      return;
    }
    if (!authLoading && userData && !isAdmin) {
      toast.error('Access denied. Admin only.');
      router.push('/');
      return;
    }
    if (isAdmin) {
      fetchProducts();
    }
  }, [userData, isAdmin, authLoading, router]);

  const fetchProducts = async () => {
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
  };

  // Import default image utility
  const getDefaultImage = (category: string): string => {
    const defaults: Record<string, string> = {
      'Electronics': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      'Clothing': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      'Home & Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
      'Sports & Fitness': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
      'Books & Stationery': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
    };
    return defaults[category] || defaults['Electronics'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Please fill in required fields');
      return;
    }

    // Validate numeric fields
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);
    
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    if (isNaN(stock) || stock < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    // Handle imageUrl - use default if empty or invalid (optional field)
    let imageUrl = formData.imageUrl?.trim() || '';
    if (!imageUrl || imageUrl === '') {
      // Use default image based on category
      imageUrl = getDefaultImage(formData.category);
    } else {
      // Validate URL format - if invalid, use default silently
      try {
        new URL(imageUrl);
      } catch {
        // Invalid URL, use default instead (don't show error since it's optional)
        imageUrl = getDefaultImage(formData.category);
      }
    }

    setSubmitting(true);
    try {
      const endpoint = '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      // Prepare body with proper types
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        stock: stock,
        category: formData.category,
        imageUrl: imageUrl,
      };
      
      const body = editingProduct 
        ? { id: editingProduct.id, ...productData, userId: userData?.uid }
        : { ...productData, userId: userData?.uid };

      const response = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userData?.uid || '',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product created!');
        resetForm();
        fetchProducts();
      } else {
        // Show detailed error messages
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((d: { field: string; message: string }) => 
            `${d.field}: ${d.message}`
          ).join(', ');
          toast.error(errorMessages || data.message || data.error || 'Operation failed');
        } else {
          toast.error(data.message || data.error || 'Operation failed');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, userId: userData?.uid }),
      });

      if (response.ok) {
        toast.success('Product deleted!');
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || 'Electronics',
      imageUrl: product.imageUrl || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: 'Electronics', imageUrl: '' });
    setEditingProduct(null);
    setShowForm(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-cyan-500" />
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800">
                Admin <span className="cyber-heading">Dashboard</span>
              </h1>
              <p className="text-gray-500 mt-2">Manage products and view analytics</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/logs">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-3 rounded-xl font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  View Logs
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(true)}
                className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Products</p>
                  <p className="text-3xl font-bold text-gray-800">{products.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">In Stock</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {products.filter(p => p.stock > 0).length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Low Stock</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {products.filter(p => p.stock > 0 && p.stock <= 5).length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Form Modal */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                onClick={() => resetForm()}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="glass-input py-3 px-4 rounded-xl w-full"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="glass-input py-3 px-4 rounded-xl w-full h-24 resize-none"
                        placeholder="Enter product description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="glass-input py-3 px-4 rounded-xl w-full"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock *
                        </label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="glass-input py-3 px-4 rounded-xl w-full"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="glass-input py-3 px-4 rounded-xl w-full"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="glass-input py-3 px-4 rounded-xl w-full"
                        placeholder="Leave empty to use category default image"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">
                        If left empty, a default image for {formData.category} will be used automatically
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            {editingProduct ? 'Update' : 'Create'}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">All Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Product</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Stock</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{product.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-800">${product.price.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-700' 
                            : product.stock <= 5 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(product)}
                            className="p-2 rounded-lg bg-cyan-100 text-cyan-600 hover:bg-cyan-200 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products yet. Add your first product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
