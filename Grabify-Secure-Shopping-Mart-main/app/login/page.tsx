'use client';

/**
 * ============================================================================
 * LOGIN PAGE - Light Theme
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ShoppingBag, UserCog, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/store/authContext';
import toast from 'react-hot-toast';

function LoginContent() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await signIn(email, password);
      router.push('/products');
    } catch {
      // Error is handled in AuthContext
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow-cyan"
            >
              <LogIn className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500">
              Sign in to continue to <span className="cyber-heading font-semibold">Grabify</span>
            </p>
          </div>

          {/* Login Form */}
          <div className="glass-card rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="glass-input pl-12 pr-4 py-3.5 rounded-xl w-full"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input pl-12 pr-4 py-3.5 rounded-xl w-full"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-400">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            {/* Registration Options */}
            <div className="space-y-3">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 hover:from-cyan-100 hover:to-cyan-200 transition-colors flex items-center justify-center gap-2 border border-cyan-200"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Customer Sign Up
                </motion.button>
              </Link>

              <Link href="/admin/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-colors flex items-center justify-center gap-2 border border-purple-200"
                >
                  <UserCog className="w-5 h-5" />
                  Admin Sign Up
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-100"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-cyan-700 font-medium">Admin Access</p>
                <p className="text-gray-500 mt-1">
                  Use secret code <code className="bg-white px-2 py-0.5 rounded text-xs font-mono text-purple-600">GRABIFY_ADMIN_2025</code> during admin registration
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
