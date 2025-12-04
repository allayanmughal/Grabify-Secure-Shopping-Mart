'use client';

/**
 * ============================================================================
 * ADMIN REGISTRATION PAGE - Light Theme
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, UserPlus, Shield, Key, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/store/authContext';
import toast from 'react-hot-toast';

// Admin secret code for registration
const ADMIN_SECRET_CODE = 'GRABIFY_ADMIN_2025';

function AdminRegisterContent() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !secretCode) {
      toast.error('Please fill in all fields');
      return;
    }

    if (secretCode !== ADMIN_SECRET_CODE) {
      toast.error('Invalid admin secret code');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await signUp(email, password, 'admin');
      toast.success('Admin account created successfully!');
      router.push('/admin');
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
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-glow-purple"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
              Admin Registration
            </h1>
            <p className="text-gray-500">
              Create your <span className="cyber-heading font-semibold">Grabify</span> admin account
            </p>
          </div>

          {/* Registration Form */}
          <div className="glass-card rounded-3xl p-8 border-2 border-purple-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Secret Code Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Secret Code
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="password"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="Enter admin secret code"
                    className="glass-input pl-12 pr-4 py-3.5 rounded-xl w-full border-purple-200 focus:border-purple-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Required for admin access
                </p>
              </div>

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
                    placeholder="admin@example.com"
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

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Admin Account
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
                  Not an admin?
                </span>
              </div>
            </div>

            {/* Customer Registration Link */}
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full py-3.5 rounded-xl font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition-colors flex items-center justify-center gap-2 border border-cyan-200"
              >
                <ShoppingBag className="w-5 h-5" />
                Customer Sign Up
              </motion.button>
            </Link>
          </div>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminRegisterPage() {
  return (
    <AuthProvider>
      <AdminRegisterContent />
    </AuthProvider>
  );
}
