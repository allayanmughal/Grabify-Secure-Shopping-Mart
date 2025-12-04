import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grabify - Secure Shopping Mart',
  description: 'A secure, modern e-commerce platform with advanced security features',
  keywords: ['e-commerce', 'shopping', 'secure', 'online store', 'grabify'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 text-gray-800 antialiased overflow-x-hidden">
        {/* Animated Background Bubbles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
          <div className="bubble bubble-4"></div>
          <div className="bubble bubble-5"></div>
          <div className="bubble bubble-6"></div>
          <div className="bubble bubble-7"></div>
          <div className="bubble bubble-8"></div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-pink-200/40 to-amber-200/40 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-purple-200/30 to-cyan-200/30 rounded-full blur-3xl animate-float" />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#1f2937',
              border: '1px solid rgba(8, 145, 178, 0.2)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#0891b2',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
