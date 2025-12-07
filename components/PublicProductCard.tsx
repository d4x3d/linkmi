'use client';

import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define a type for the product
interface Product {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  price: number;
  fileId?: string;
  position: number;
}

export default function PublicProductCard({ product }: { product: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const buyProduct = useAction(api.products.buy);

  const handleBuyClick = () => {
    setIsExpanded(true);
  };

  const handlePay = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await buyProduct({
        productId: product._id,
        email: email,
      });

      // Redirect to Paystack
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        alert('Failed to initialize payment.');
      }
    } catch (error: any) {
      console.error(error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="block w-full p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{product.name}</h3>
          {product.description && <p className="text-sm text-neutral-500 mt-1">{product.description}</p>}
        </div>
        <div className="text-right">
          {product.discountPercentage ? (
            <div className="flex flex-col items-end">
              <span className="block font-bold text-violet-600">
                ₦{(Math.round(product.price * (1 - product.discountPercentage / 100)) / 100).toLocaleString()}
              </span>
              <span className="block text-xs text-neutral-400 line-through">
                ₦{(product.price / 100).toLocaleString()}
              </span>
              <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] px-1.5 py-0.5 rounded-full mt-1 font-medium">
                -{product.discountPercentage}% OFF
              </span>
            </div>
          ) : (
            <span className="block font-bold">₦{(product.price / 100).toLocaleString()}</span>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-hidden">
        {!isExpanded ? (
          <button
            onClick={handleBuyClick}
            className="w-full py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-300 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            Buy Now
          </button>
        ) : (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              className="bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-600 rounded-none px-0 focus-visible:ring-0 focus-visible:border-neutral-900 dark:focus-visible:border-neutral-100 transition-colors shadow-none"
            />
            <Button
              onClick={handlePay}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
