'use client';

import { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';

interface Product {
  _id: Id<'products'>;
  name: string;
  description?: string;
  price: number;
  discountPercentage?: number;
  imageUrl?: string | null;
}

interface ProductsSectionProps {
  products: Product[];
  layoutStyle: string;
  cardStyle: string;
  buttonColor: string;
  isDarkBg: boolean;
  textColor: string;
  buttonRadius: string;
  userId: string;
}

export default function ProductsSection({
  products,
  layoutStyle,
  cardStyle,
  buttonColor,
  isDarkBg,
  textColor,
  buttonRadius,
  userId,
}: ProductsSectionProps) {
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initializeTransaction = useAction(api.paystack.initializeTransaction);

  const getCardClasses = () => {
    if (cardStyle === 'glass') return 'bg-white/10 backdrop-blur-md border border-white/20';
    if (cardStyle === 'outline') return `border-2 ${isDarkBg ? 'border-white/30' : 'border-neutral-200'}`;
    if (cardStyle === 'shadow') return 'bg-white shadow-lg border-0';
    return isDarkBg ? 'bg-white/90 border border-white/20' : 'bg-white border border-neutral-200';
  };

  const getCardTextColor = () => {
    if (cardStyle === 'glass') return '#ffffff';
    if (cardStyle === 'shadow' || cardStyle === 'solid') return isDarkBg ? '#1a1a1a' : textColor;
    return isDarkBg ? '#ffffff' : textColor;
  };

  const getDiscountedPrice = (product: Product) => {
    if (product.discountPercentage && product.discountPercentage > 0) {
      return Math.round(product.price * (1 - product.discountPercentage / 100));
    }
    return product.price;
  };

  const handleBuyClick = (productId: string) => {
    setBuyingProductId(productId);
    setEmail('');
  };

  const handleCancelBuy = () => {
    setBuyingProductId(null);
    setEmail('');
  };

  const handleProceedToPayment = async (product: Product) => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const finalPrice = getDiscountedPrice(product);

    try {
      const result = await initializeTransaction({
        email,
        amount: finalPrice,
        metadata: JSON.stringify({
          productId: product._id,
          productName: product.name,
          userId,
        }),
      });

      // Redirect to Paystack
      window.location.href = result.authorization_url;
    } catch (error) {
      console.error(error);
      toast.error('Failed to initialize payment. Please try again.');
      setIsLoading(false);
    }
  };

  const cardTextColor = getCardTextColor();
  const cardClasses = getCardClasses();

  return (
    <div className={cn('gap-4', layoutStyle === 'grid' ? 'grid grid-cols-2' : 'grid grid-cols-1')}>
      {products.map((product) => (
        <div
          key={product._id}
          className={cn('overflow-hidden transition-all duration-300 hover:scale-[1.02]', cardClasses)}
          style={{ borderRadius: buttonRadius }}
        >
          {/* Image */}
          <div className="aspect-square bg-neutral-100 overflow-hidden relative">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-20 text-neutral-500">
                <ShoppingBag className="w-12 h-12" />
              </div>
            )}
            {product.discountPercentage && product.discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                -{product.discountPercentage}%
              </div>
            )}
          </div>
          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold truncate" style={{ color: cardTextColor }}>
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm mt-1 line-clamp-2 opacity-70" style={{ color: cardTextColor }}>
                {product.description}
              </p>
            )}

            {/* Buy Action Area */}
            <div className="flex items-center justify-between mt-3 h-10">
              {buyingProductId === product._id ? (
                <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-right-4 duration-200">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address..."
                    className="h-8 text-sm flex-1 min-w-0 bg-white/50 backdrop-blur-sm"
                    style={{
                      color: cardTextColor === '#ffffff' ? '#ffffff' : undefined,
                      borderColor: isDarkBg ? 'rgba(255,255,255,0.2)' : undefined,
                    }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleProceedToPayment(product);
                      if (e.key === 'Escape') handleCancelBuy();
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleProceedToPayment(product)}
                    disabled={isLoading}
                    style={{ backgroundColor: buttonColor, borderRadius: buttonRadius }}
                    className="h-8 px-3 shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-white" />
                    )}
                  </Button>
                  <button
                    onClick={handleCancelBuy}
                    className="p-1 opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: cardTextColor }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <div className="flex flex-col leading-tight">
                      <span className="font-bold" style={{ color: cardTextColor }}>
                        ₦{(getDiscountedPrice(product) / 100).toLocaleString()}
                      </span>
                      <span className="text-[10px] line-through opacity-60" style={{ color: cardTextColor }}>
                        ₦{(product.price / 100).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold" style={{ color: cardTextColor }}>
                      ₦{(product.price / 100).toLocaleString()}
                    </span>
                  )}

                  <button
                    onClick={() => handleBuyClick(product._id)}
                    className="px-4 py-2 text-white text-sm font-medium transition-opacity hover:opacity-90 shadow-sm"
                    style={{ backgroundColor: buttonColor, borderRadius: buttonRadius }}
                  >
                    Buy
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
