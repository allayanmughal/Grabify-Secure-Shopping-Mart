'use client';

/**
 * ============================================================================
 * HOME PAGE - Light Theme with Bubble Animations
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Shield, 
  Zap, 
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Star
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { AuthProvider } from '@/store/authContext';
import { useStore, Product } from '@/store/useStore';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';

function HomeContent() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), limit(6));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Protected by advanced DLL security and Zod validation',
      color: 'from-cyan-400 to-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with Next.js 14 for optimal performance',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Lock,
      title: 'Data Protection',
      description: 'Your data is encrypted and logged for security',
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      icon: Globe,
      title: 'Cloud Powered',
      description: 'Hosted on Firebase for reliability and scale',
      color: 'from-amber-400 to-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-100 to-purple-100 border border-cyan-200 mb-8"
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-700">Secure E-Commerce Platform</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6"
          >
            <span className="cyber-heading">Grab</span>
            <span className="text-gray-800">ify</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of online shopping with our{' '}
            <span className="text-cyan-600 font-semibold">secure</span> platform built with{' '}
            <span className="text-purple-600 font-semibold">cutting-edge</span> technology
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(8, 145, 178, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex items-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button rounded-2xl px-8 py-4"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
          >
            {[
              { value: '100%', label: 'Secure' },
              { value: '24/7', label: 'Support' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm shadow-soft"
                whileHover={{ y: -5 }}
              >
                <p className="text-3xl md:text-4xl font-extrabold cyber-heading">{stat.value}</p>
                <p className="text-gray-500 mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800">
              Why Choose <span className="cyber-heading">Grabify</span>?
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Built with security and performance at its core
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
                className={`glass-card rounded-3xl p-8 text-center group ${feature.bgColor}/30`}
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-cyan-50/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-2 text-gray-800">
                Featured <span className="cyber-heading">Products</span>
              </h2>
              <p className="text-gray-500">Discover our most popular items</p>
            </div>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button rounded-xl flex items-center gap-2 font-semibold"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-3xl p-6">
                  <div className="h-48 bg-gray-200 rounded-2xl mb-4 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-card rounded-3xl"
            >
              <ShoppingBag className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-2xl font-bold mb-2 text-gray-700">No Products Yet</h3>
              <p className="text-gray-500 mb-6">
                Products will appear here once added by admin
              </p>
              <Link href="/admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                >
                  Add Products
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800">
              What Our <span className="cyber-heading">Customers</span> Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah J.', text: 'Amazing shopping experience! Fast delivery and secure payments.', rating: 5 },
              { name: 'Mike R.', text: 'Best e-commerce platform I\'ve used. Love the modern design!', rating: 5 },
              { name: 'Emily T.', text: 'The security features give me peace of mind when shopping.', rating: 5 },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-3xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                <p className="font-semibold text-gray-800">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/50 via-purple-100/50 to-pink-100/50" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800">
              Ready to <span className="cyber-heading">Shop</span>?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers and experience secure, 
              fast, and reliable online shopping
            </p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-glow-cyan transition-shadow"
              >
                Create Free Account
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p className="mb-2 font-medium">© 2024 Grabify - Secure Shopping Mart</p>
          <p className="text-sm">
            Built with Next.js, Firebase, and ❤️ for the Competition
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
