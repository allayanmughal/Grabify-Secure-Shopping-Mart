/**
 * ============================================================================
 * SEED API - Add Sample Products to Database
 * ============================================================================
 * Grabify Secure Shopping Mart
 * 2 Products per Category
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/database/firebaseConfig';

const sampleProducts = [
  // Electronics (2 products)
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life. Crystal clear audio and comfortable fit for all-day wear.',
    price: 149.99,
    stock: 50,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, GPS, and water resistance up to 50 meters.',
    price: 299.99,
    stock: 35,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  },
  
  // Clothing (2 products)
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Soft, breathable 100% organic cotton t-shirt. Available in multiple colors. Perfect for everyday wear.',
    price: 29.99,
    stock: 200,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket with modern fit. Durable construction with vintage wash finish.',
    price: 89.99,
    stock: 45,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop',
  },
  
  // Home & Kitchen (2 products)
  {
    name: 'Smart Coffee Maker',
    description: 'WiFi-enabled coffee maker with programmable brewing. Make coffee from your phone!',
    price: 159.99,
    stock: 30,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
  },
  {
    name: 'Non-Stick Cookware Set',
    description: '10-piece non-stick cookware set with heat-resistant handles. Dishwasher safe.',
    price: 199.99,
    stock: 25,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
  },
  
  // Sports & Fitness (2 products)
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick eco-friendly yoga mat with carrying strap. Non-slip surface for all workouts.',
    price: 39.99,
    stock: 120,
    category: 'Sports & Fitness',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
  },
  {
    name: 'Adjustable Dumbbells',
    description: 'Space-saving adjustable dumbbells. 5-52.5 lbs per hand with quick adjustment.',
    price: 349.99,
    stock: 20,
    category: 'Sports & Fitness',
    imageUrl: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400&h=400&fit=crop',
  },
  
  // Books & Stationery (2 products)
  {
    name: 'Premium Leather Journal',
    description: 'Handcrafted leather journal with 200 pages of acid-free paper. Perfect for writing.',
    price: 34.99,
    stock: 85,
    category: 'Books & Stationery',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
  },
  {
    name: 'Fountain Pen Set',
    description: 'Elegant fountain pen with ink converter and 3 ink cartridges. Smooth writing experience.',
    price: 59.99,
    stock: 50,
    category: 'Books & Stationery',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop',
  },
];

export async function POST(request: NextRequest) {
  try {
    // Get the reset parameter from query string
    const { searchParams } = new URL(request.url);
    const reset = searchParams.get('reset') === 'true';
    
    // Check if products already exist
    const existingProducts = await getDocs(collection(db, 'products'));
    
    // If reset is true, delete all existing products first
    if (reset && existingProducts.size > 0) {
      await Promise.all(
        existingProducts.docs.map(doc => deleteDoc(doc.ref))
      );
    } else if (existingProducts.size > 0 && !reset) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingProducts.size} products. Use ?reset=true to replace them.`,
        count: existingProducts.size,
      });
    }
    
    // Add all sample products
    const results = await Promise.all(
      sampleProducts.map(async (product) => {
        const docRef = await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        return { id: docRef.id, name: product.name, category: product.category };
      })
    );
    
    // Group by category for response
    const byCategory = results.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item.name);
      return acc;
    }, {} as Record<string, string[]>);
    
    return NextResponse.json({
      success: true,
      message: `Successfully added ${results.length} products (2 per category)!`,
      totalProducts: results.length,
      categories: Object.keys(byCategory).length,
      productsByCategory: byCategory,
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Group products by category for preview
  const byCategory = sampleProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product.name);
    return acc;
  }, {} as Record<string, string[]>);
  
  return NextResponse.json({
    message: 'Use POST to seed the database with sample products. Use POST ?reset=true to replace existing products.',
    totalProducts: sampleProducts.length,
    productsPerCategory: 2,
    categories: [...new Set(sampleProducts.map(p => p.category))],
    productsByCategory: byCategory,
  });
}
