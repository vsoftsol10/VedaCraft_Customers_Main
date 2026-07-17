import { ShieldCheck, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export default function PriceSummaryPanel({ items, currentStep, onContinue, canContinue, isBuyNow = false, deliveryInfo, }) {
    const { t } = useTranslation();
    const totalMRP = items.reduce((acc, item) => acc + Math.round(item.price * 2) * item.quantity, 0);
    const totalDiscount = items.reduce((acc, item) => acc + Math.round(item.price) * item.quantity, 0);
    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const savings = totalMRP - totalAmount;
    const ctaLabel = currentStep === 3 ? t('checkout.placeOrder') : t('checkout.continue');
    return (<div className="w-full lg:w-96 flex-shrink-0">
      <div className="bg-white border border-gray-200 sticky top-24">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
            {t('checkout.priceDetails')}
          </h2>
        </div>

        {/* Buy Now — Product Preview Card */}
        {isBuyNow && items.length > 0 && (<div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <img src={items[0].image} alt={items[0].name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-amber-100"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
                  {items[0].name}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  &#8377;{items[0].price.toLocaleString('en-IN')}
                </p>
                <span className="inline-block text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold mt-1">
                  {t('checkout.buyNow')}
                </span>
              </div>
            </div>
          </div>)}

        {/* Price Breakdown */}
        <div className="p-5 space-y-4 text-sm">
          {/* Total MRP */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {t('checkout.totalMRP')} ({items.reduce((a, i) => a + i.quantity, 0)} {t('checkout.items')})
            </span>
            <span className="text-gray-900">&#8377;{totalMRP.toLocaleString('en-IN')}</span>
          </div>

          {/* Discount */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('checkout.discountOnMRP')}</span>
            <span className="text-green-600 font-medium">
              -&#8377;{totalDiscount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Delivery Charges */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('checkout.deliveryCharges')}</span>
            <span className="text-green-600 font-medium">{t('checkout.free')}</span>
          </div>

          {/* Divider + Total */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">
                {t('checkout.totalAmount')}
              </span>
              <span className="text-base font-bold text-gray-900">
                &#8377;{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Savings Banner */}
          {savings > 0 && (<div className="bg-green-50 border border-green-200 rounded-md px-4 py-2.5 text-center">
              <span className="text-green-700 text-sm font-medium flex items-center justify-center gap-1.5">
                <Tag className="w-4 h-4"/>
                {t('checkout.savingsMessage', { amount: savings.toLocaleString('en-IN') })}
              </span>
            </div>)}
        </div>

        {/* Trust Badge */}
        <div className="px-5 pb-4">
          <div className="flex items-start gap-3 text-xs text-gray-500 bg-gray-50 rounded-md p-3">
            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"/>
            <span>{t('checkout.secureCheckout')}</span>
          </div>
        </div>

        {/* Delivery State Info */}
        {deliveryInfo && !deliveryInfo.is_active && (<div className="px-5 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-600 font-semibold text-center">
              {t('checkout.deliveryUnavailable')}
            </div>
          </div>)}
        
        {deliveryInfo && deliveryInfo.is_active && deliveryInfo.estimated_days && (<div className="px-5 pb-4">
             <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2.5 rounded-md text-center">
               {t('checkout.estimatedDelivery', { days: deliveryInfo.estimated_days })}
             </div>
          </div>)}

        {/* Sticky CTA Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 line-through">
                &#8377;{totalMRP.toLocaleString('en-IN')}
              </p>
              <p className="text-xl font-bold text-gray-900">
                &#8377;{totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <button disabled={!canContinue} onClick={onContinue} className={`px-8 py-3 rounded font-semibold text-sm transition-all duration-200 ${canContinue
            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-200 active:scale-[0.98]'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </div>);
}
