'use client';

/**
 * ============================================================================
 * ABOUT PAGE - Light Theme
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Code, 
  Database,
  Lock,
  FileText,
  Award,
  Users
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/store/authContext';

function AboutContent() {
  const features = [
    {
      icon: Shield,
      title: 'Password-Protected DLL',
      description: 'Our custom security module requires password authentication for all sensitive database operations.',
      color: 'from-cyan-400 to-cyan-600',
    },
    {
      icon: Lock,
      title: 'Zod Validation',
      description: 'All inputs are strictly validated using Zod schemas to prevent injection attacks.',
      color: 'from-purple-400 to-purple-600',
    },
    {
      icon: Database,
      title: 'Firebase Integration',
      description: 'Cloud-hosted database with real-time synchronization and secure authentication.',
      color: 'from-pink-400 to-pink-600',
    },
    {
      icon: FileText,
      title: 'Activity Logging',
      description: 'Every sensitive action is logged for audit trails and security monitoring.',
      color: 'from-amber-400 to-amber-600',
    },
  ];

  const techStack = [
    { name: 'Next.js 14', desc: 'App Router' },
    { name: 'Firebase', desc: 'Auth & Firestore' },
    { name: 'Tailwind CSS', desc: 'Styling' },
    { name: 'Framer Motion', desc: 'Animations' },
    { name: 'Zod', desc: 'Validation' },
    { name: 'TypeScript', desc: 'Type Safety' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow-cyan"
            >
              <Award className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              <span className="text-gray-800">About </span>
              <span className="cyber-heading">Grabify</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              A secure, modern e-commerce platform built for the Web Development Competition,
              showcasing advanced security practices and cutting-edge technologies.
            </p>
          </motion.div>

          {/* Security Features */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Security <span className="cyber-heading">Features</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-card rounded-3xl p-8"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Architecture */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Project <span className="cyber-heading">Architecture</span>
            </h2>
            <div className="glass-card rounded-3xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <Code className="w-5 h-5 text-cyan-500" />
                    Folder Structure
                  </h3>
                  <div className="font-mono text-sm bg-gray-50 rounded-xl p-4 space-y-1">
                    <p className="text-cyan-600">/app</p>
                    <p className="text-gray-500 pl-4">└── Frontend Pages</p>
                    <p className="text-cyan-600">/app/api</p>
                    <p className="text-gray-500 pl-4">└── REST API Routes</p>
                    <p className="text-purple-600">/libs</p>
                    <p className="text-gray-500 pl-4">└── Secure DLL Module</p>
                    <p className="text-pink-600">/database</p>
                    <p className="text-gray-500 pl-4">└── Firebase Config</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-500" />
                    Firestore Collections
                  </h3>
                  <ul className="space-y-3">
                    {['users', 'products', 'cart', 'orders', 'logs'].map((col) => (
                      <li key={col} className="flex items-center gap-3 text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
                        <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm">{col}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tech Stack */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Tech <span className="cyber-heading">Stack</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <p className="font-bold text-gray-800">{tech.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Team */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="glass-card rounded-3xl p-12 bg-gradient-to-br from-cyan-50/50 to-purple-50/50">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Competition <span className="cyber-heading">Entry</span>
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
                This project was developed for the Web Development Competition, 
                demonstrating secure e-commerce architecture with modern technologies 
                and best practices in security and user experience.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                <span className="px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 font-medium text-sm">
                  🔒 Secure
                </span>
                <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-medium text-sm">
                  ⚡ Modern
                </span>
                <span className="px-4 py-2 rounded-full bg-pink-100 text-pink-700 font-medium text-sm">
                  ✨ Animated
                </span>
                <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-medium text-sm">
                  🏆 Competition Ready
                </span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

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

export default function AboutPage() {
  return (
    <AuthProvider>
      <AboutContent />
    </AuthProvider>
  );
}
