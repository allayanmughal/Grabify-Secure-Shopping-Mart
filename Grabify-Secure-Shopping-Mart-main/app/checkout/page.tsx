'use client';

/**
 * ============================================================================
 * CHECKOUT PAGE - Complete Payment Flow
 * ============================================================================
 * Grabify Secure Shopping Mart
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  User, 
  MapPin, 
  Lock,
  ShoppingBag,
  ArrowLeft,
  Check,
  Phone,
  Globe,
  Calendar,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/store/authContext';
import { useStore } from '@/store/useStore';
import { getProductImageUrl } from '@/libs/imageUtils';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Payment Step Types
type PaymentStep = 'shipping' | 'payment' | 'review' | 'processing' | 'success';

function CheckoutContent() {
  const router = useRouter();
  const { userData } = useAuth();
  const { cart, getCartTotal, clearCart } = useStore();
  const [currentStep, setCurrentStep] = useState<PaymentStep>('shipping');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    transactionId: string;
    estimatedDelivery: string;
  } | null>(null);

  // Shipping Form Data
  const [shippingData, setShippingData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });

  // Payment Form Data
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const total = getCartTotal();
  const tax = total * 0.08; // 8% tax
  const shipping = total > 100 ? 0 : 9.99;
  const grandTotal = total + tax + shipping;

  // Auto-fill email if logged in
  useEffect(() => {
    if (userData?.email) {
      setShippingData(prev => ({ ...prev, fullName: userData.email.split('@')[0] }));
    }
  }, [userData]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  // Validate shipping form
  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    
    if (!shippingData.fullName || shippingData.fullName.length < 2) {
      newErrors.fullName = 'Full name is required';
    }
    if (!shippingData.address || shippingData.address.length < 5) {
      newErrors.address = 'Valid address is required';
    }
    if (!shippingData.city || shippingData.city.length < 2) {
      newErrors.city = 'City is required';
    }
    if (!shippingData.state || shippingData.state.length < 2) {
      newErrors.state = 'State is required';
    }
    if (!shippingData.zipCode || !/^\d{5}(-\d{4})?$/.test(shippingData.zipCode)) {
      newErrors.zipCode = 'Valid ZIP code required (e.g., 12345)';
    }
    if (!shippingData.phone || !/^\+?[\d\s\-\(\)]{10,20}$/.test(shippingData.phone)) {
      newErrors.phone = 'Valid phone number required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate payment form
  const validatePayment = () => {
    const newErrors: Record<string, string> = {};
    
    const cardNum = paymentData.cardNumber.replace(/\s/g, '');
    if (!cardNum || cardNum.length !== 16) {
      newErrors.cardNumber = 'Valid 16-digit card number required';
    }
    if (!paymentData.cardholderName || paymentData.cardholderName.length < 2) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    if (!paymentData.expiryMonth || !/^(0[1-9]|1[0-2])$/.test(paymentData.expiryMonth)) {
      newErrors.expiryMonth = 'Valid month (01-12)';
    }
    if (!paymentData.expiryYear || !/^\d{2}$/.test(paymentData.expiryYear)) {
      newErrors.expiryYear = 'Valid year (YY)';
    }
    if (!paymentData.cvv || !/^\d{3,4}$/.test(paymentData.cvv)) {
      newErrors.cvv = 'Valid CVV required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (currentStep === 'shipping' && validateShipping()) {
      setCurrentStep('payment');
    } else if (currentStep === 'payment' && validatePayment()) {
      setCurrentStep('review');
    }
  };

  // Process checkout
  const handleCheckout = async () => {
    if (!userData) {
      toast.error('Please sign in to checkout');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setCurrentStep('processing');
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userData.uid,
        },
        body: JSON.stringify({
          paymentInfo: {
            cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
            cardholderName: paymentData.cardholderName,
            expiryMonth: paymentData.expiryMonth,
            expiryYear: paymentData.expiryYear,
            cvv: paymentData.cvv,
          },
          shippingAddress: shippingData,
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
          total: grandTotal,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrderResult({
          orderId: data.order.id,
          transactionId: data.order.transactionId,
          estimatedDelivery: data.order.estimatedDelivery,
        });
        clearCart();
        setCurrentStep('success');
        toast.success('Order placed successfully!');
      } else {
        setCurrentStep('review');
        toast.error(data.message || data.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCurrentStep('review');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Empty cart view
  if (cart.length === 0 && currentStep !== 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
        <Navbar />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center"
            >
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8">Add some products before checking out</p>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
              >
                Browse Products
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success view
  if (currentStep === 'success' && orderResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
        <Navbar />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 className="w-14 h-14 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Order Confirmed!</h1>
              <p className="text-gray-500 mb-8">Thank you for your purchase</p>
              
              <div className="glass-card rounded-2xl p-6 text-left space-y-4 mb-8">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono font-bold text-cyan-600">{orderResult.orderId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-sm text-gray-700">{orderResult.transactionId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Total Paid</span>
                  <span className="font-bold text-gray-800">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estimated Delivery</span>
                  <span className="font-semibold text-green-600">
                    {new Date(orderResult.estimatedDelivery).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/orders">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
                  >
                    View My Orders
                  </motion.button>
                </Link>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl font-semibold bg-white text-gray-700 border border-gray-200 shadow-md hover:bg-gray-50"
                  >
                    Continue Shopping
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Processing view
  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
        <Navbar />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <Loader2 className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Processing Payment...</h1>
            <p className="text-gray-500">Please wait while we process your order</p>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Lock className="w-4 h-4" />
              <span>Secured with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50">
      <Navbar />

      <div className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to shopping
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
              Secure <span className="cyber-heading">Checkout</span>
            </h1>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {['shipping', 'payment', 'review'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div 
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep === step 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' 
                        : ['shipping', 'payment', 'review'].indexOf(currentStep) > index
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {['shipping', 'payment', 'review'].indexOf(currentStep) > index ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`ml-2 text-xs sm:text-sm font-medium hidden sm:block ${
                    currentStep === step ? 'text-cyan-600' : 'text-gray-500'
                  }`}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                  {index < 2 && (
                    <div className={`w-8 sm:w-16 h-1 mx-2 rounded-full ${
                      ['shipping', 'payment', 'review'].indexOf(currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Shipping Form */}
              <AnimatePresence mode="wait">
                {currentStep === 'shipping' && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card rounded-2xl p-4 sm:p-6"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-cyan-500" />
                      Shipping Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={shippingData.fullName}
                            onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                            className={`glass-input pl-12 pr-4 py-3 rounded-xl w-full ${errors.fullName ? 'border-red-400' : ''}`}
                            placeholder="John Doe"
                          />
                        </div>
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                        <input
                          type="text"
                          value={shippingData.address}
                          onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                          className={`glass-input px-4 py-3 rounded-xl w-full ${errors.address ? 'border-red-400' : ''}`}
                          placeholder="123 Main Street, Apt 4B"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                          <input
                            type="text"
                            value={shippingData.city}
                            onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                            className={`glass-input px-4 py-3 rounded-xl w-full ${errors.city ? 'border-red-400' : ''}`}
                            placeholder="New York"
                          />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                          <input
                            type="text"
                            value={shippingData.state}
                            onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                            className={`glass-input px-4 py-3 rounded-xl w-full ${errors.state ? 'border-red-400' : ''}`}
                            placeholder="NY"
                          />
                          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                          <input
                            type="text"
                            value={shippingData.zipCode}
                            onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                            className={`glass-input px-4 py-3 rounded-xl w-full ${errors.zipCode ? 'border-red-400' : ''}`}
                            placeholder="10001"
                          />
                          {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                              value={shippingData.country}
                              onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                              className="glass-input pl-12 pr-4 py-3 rounded-xl w-full appearance-none cursor-pointer"
                            >
                              <option value="United States">United States</option>
                              <option value="Canada">Canada</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Australia">Australia</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={shippingData.phone}
                            onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                            className={`glass-input pl-12 pr-4 py-3 rounded-xl w-full ${errors.phone ? 'border-red-400' : ''}`}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNextStep}
                      className="w-full mt-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow"
                    >
                      Continue to Payment
                    </motion.button>
                  </motion.div>
                )}

                {/* Payment Form */}
                {currentStep === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card rounded-2xl p-4 sm:p-6"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-500" />
                      Payment Details
                    </h2>
                    
                    {/* Card Preview */}
                    <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />
                      <div className="relative">
                        <div className="flex justify-between items-start mb-8">
                          <div className="w-12 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md" />
                          <CreditCard className="w-8 h-8 text-white/50" />
                        </div>
                        <p className="font-mono text-lg sm:text-xl tracking-wider mb-4">
                          {paymentData.cardNumber || '•••• •••• •••• ••••'}
                        </p>
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-white/50 text-xs">CARDHOLDER</p>
                            <p className="font-medium uppercase">{paymentData.cardholderName || 'YOUR NAME'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/50 text-xs">EXPIRES</p>
                            <p className="font-medium">
                              {paymentData.expiryMonth || 'MM'}/{paymentData.expiryYear || 'YY'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={paymentData.cardNumber}
                            onChange={(e) => setPaymentData({ ...paymentData, cardNumber: formatCardNumber(e.target.value) })}
                            className={`glass-input pl-12 pr-4 py-3 rounded-xl w-full font-mono ${errors.cardNumber ? 'border-red-400' : ''}`}
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                          />
                        </div>
                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          value={paymentData.cardholderName}
                          onChange={(e) => setPaymentData({ ...paymentData, cardholderName: e.target.value })}
                          className={`glass-input px-4 py-3 rounded-xl w-full uppercase ${errors.cardholderName ? 'border-red-400' : ''}`}
                          placeholder="JOHN DOE"
                        />
                        {errors.cardholderName && <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={paymentData.expiryMonth}
                              onChange={(e) => setPaymentData({ ...paymentData, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                              className={`glass-input pl-10 pr-2 py-3 rounded-xl w-full ${errors.expiryMonth ? 'border-red-400' : ''}`}
                              placeholder="MM"
                              maxLength={2}
                            />
                          </div>
                          {errors.expiryMonth && <p className="text-red-500 text-xs mt-1">{errors.expiryMonth}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                          <input
                            type="text"
                            value={paymentData.expiryYear}
                            onChange={(e) => setPaymentData({ ...paymentData, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                            className={`glass-input px-4 py-3 rounded-xl w-full ${errors.expiryYear ? 'border-red-400' : ''}`}
                            placeholder="YY"
                            maxLength={2}
                          />
                          {errors.expiryYear && <p className="text-red-500 text-xs mt-1">{errors.expiryYear}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="password"
                              value={paymentData.cvv}
                              onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              className={`glass-input pl-10 pr-2 py-3 rounded-xl w-full ${errors.cvv ? 'border-red-400' : ''}`}
                              placeholder="•••"
                              maxLength={4}
                            />
                          </div>
                          {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-100">
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-500" />
                        Your payment is secured with 256-bit SSL encryption. We never store your card details.
                      </p>
                    </div>
                    
                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={() => setCurrentStep('shipping')}
                        className="flex-1 py-4 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNextStep}
                        className="flex-1 py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow"
                      >
                        Review Order
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Review Order */}
                {currentStep === 'review' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Shipping Summary */}
                    <div className="glass-card rounded-2xl p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-cyan-500" />
                          Shipping Address
                        </h3>
                        <button 
                          onClick={() => setCurrentStep('shipping')}
                          className="text-cyan-600 text-sm font-medium hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-gray-600 space-y-1">
                        <p className="font-semibold">{shippingData.fullName}</p>
                        <p>{shippingData.address}</p>
                        <p>{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
                        <p>{shippingData.country}</p>
                        <p className="text-gray-500">{shippingData.phone}</p>
                      </div>
                    </div>
                    
                    {/* Payment Summary */}
                    <div className="glass-card rounded-2xl p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-purple-500" />
                          Payment Method
                        </h3>
                        <button 
                          onClick={() => setCurrentStep('payment')}
                          className="text-cyan-600 text-sm font-medium hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white/70" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            •••• •••• •••• {paymentData.cardNumber.slice(-4)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires {paymentData.expiryMonth}/{paymentData.expiryYear}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentStep('payment')}
                        className="flex-1 py-4 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckout}
                        disabled={loading}
                        className="flex-1 py-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Lock className="w-5 h-5" />
                        Pay ${grandTotal.toFixed(2)}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="glass-card rounded-2xl p-4 sm:p-6 sticky top-32">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-cyan-500" />
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={getProductImageUrl(item.product.imageUrl, item.product.category)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-cyan-600 font-semibold text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Tax (8%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                    <span className="text-gray-800">Total</span>
                    <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {shipping > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs text-amber-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Add ${(100 - total).toFixed(2)} more for FREE shipping!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthProvider>
      <CheckoutContent />
    </AuthProvider>
  );
}
