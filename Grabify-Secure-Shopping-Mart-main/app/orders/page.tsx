'use client';

/**
 * ============================================================================
 * ORDERS PAGE - Light Theme
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/store/authContext';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';
import Link from 'next/link';

interface Order {
  id: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: { seconds: number };
  items?: Array<{ productId: string; quantity: number; price: number }>;
}

function OrdersContent() {
  const router = useRouter();
  const { userData, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push('/login');
      return;
    }

    if (userData) {
      fetchOrders();
    }
  }, [userData, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userData?.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-cyan-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'processing':
        return 'bg-cyan-100 text-cyan-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="text-gray-800">My </span>
              <span className="cyber-heading">Orders</span>
            </h1>
            <p className="text-gray-500">Track and manage your orders</p>
          </motion.div>

          {/* Orders List */}
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-md">
                        <Package className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-gray-500 mb-1">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  {order.items && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} in this order
                      </p>
                    </div>
                  )}
                </motion.div>
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
                >
                  Start Shopping
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

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

export default function OrdersPage() {
  return (
    <AuthProvider>
      <OrdersContent />
    </AuthProvider>
  );
}
