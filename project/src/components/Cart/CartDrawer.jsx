import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Tag, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import { getProductPricing, isOfferActive } from '../../utils/pricing';

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
}).format(Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0);

export default function CartDrawer() {
    const { t } = useTranslation();
    const { items, isOpen, isLoading, isUpdating, toggleCart, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);

    if (!isOpen)
        return null;

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const bagTotal = items.reduce((acc, item) => acc + getProductPricing(item).mrp * item.quantity, 0);
    const discount = items.reduce((acc, item) => acc + getProductPricing(item).discountAmount * item.quantity, 0) + couponDiscount;
    const subtotal = Math.max(0, items.reduce((acc, item) => acc + getProductPricing(item).salePrice * item.quantity, 0) - couponDiscount);
    const youPay = subtotal;

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        const code = couponCode.trim().toUpperCase();
        if (!code) return;
        if (code === 'VEDA10' || code === 'ECO10') {
            const rawSubtotal = items.reduce((acc, item) => acc + getProductPricing(item).salePrice * item.quantity, 0);
            setCouponDiscount(Math.round(rawSubtotal * 0.1));
            setCouponMessage(`Coupon ${code} applied (10% off)`);
        } else {
            setCouponDiscount(0);
            setCouponMessage('Try code VEDA10 for 10% off');
        }
    };

    return (<>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[99] transition-opacity" onClick={() => toggleCart(false)}/>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[100] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center px-4 py-4 bg-white">
          <button onClick={() => toggleCart(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors mr-2 text-gray-800">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <h2 className="text-lg font-bold text-gray-900">{t('cart.title', 'Your Cart')}</h2>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 bg-white">
          {isLoading ? (<div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-[#346b3f]"/>
              <p className="text-sm">{t('cart.loading', 'Loading cart...')}</p>
            </div>) : items.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <p>{t('cart.empty')}</p>
              <button onClick={() => toggleCart(false)} className="text-green-600 font-medium hover:underline">
                {t('cart.continueShopping')}
              </button>
            </div>) : (<>
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const stock = Number(item.stock);
                  const maxQty = Number.isFinite(stock) && stock > 0 ? Math.min(stock, 10) : 10;
                  const unitPrice = getProductPricing(item).salePrice;

                  return (<div key={item.id} className="bg-white p-3 border border-gray-200 rounded-lg relative">
                    <div className="flex gap-3 items-start">
                      <img src={item.image} alt={t(`productsData.${item.name}`, item.name)} className="w-16 h-16 object-cover rounded-md border border-gray-100 flex-shrink-0"/>
                      
                      <div className="flex-1 pr-7 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 leading-snug truncate">{t(`productsData.${item.name}`, item.name)}</h3>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{formatCurrency(unitPrice * item.quantity)}</p>
                        {isOfferActive(item.activeOffer) && <p className="text-[11px] font-semibold text-amber-700 mt-0.5">{item.activeOffer.name} applied</p>}
                        
                        <div className="flex items-center text-xs text-gray-700 mt-1">
                          <span className="mr-1">{t('cart.quantity', 'Qty')} :</span>
                          <select
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                            disabled={isUpdating}
                            className="bg-transparent text-xs font-medium text-gray-800 focus:outline-none cursor-pointer pr-1"
                          >
                            {Array.from({ length: maxQty }, (_, i) => i + 1).map((qty) => (
                              <option key={qty} value={qty}>{qty}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <button onClick={() => removeFromCart(item.id)} disabled={isUpdating} className="p-1 text-gray-500 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40" aria-label="Remove item">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>);
                })}
              </div>

              {/* Apply Coupon Card */}
              <div className="mt-4 bg-white p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400"/>
                    <span className="text-sm font-semibold text-gray-900">{t('cart.applyCoupon', 'Apply Coupon')}</span>
                  </div>
                  <button type="button" onClick={() => setCouponCode('VEDA10')} className="flex items-center gap-0.5 text-[11px] text-gray-400 hover:text-green-700 transition-colors">
                    {t('cart.viewCoupons', 'View Coupons')}
                    <ChevronRight className="w-3 h-3"/>
                  </button>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex w-full">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t('cart.enterCoupon', 'Enter coupon code')}
                    className="flex-1 min-w-0 h-10 px-3 text-xs text-gray-800 placeholder-gray-400 border border-gray-300 border-r-0 rounded-l-[4px] focus:outline-none focus:border-[#558B2F]"
                  />
                  <button type="submit" className="h-10 px-6 bg-[#558B2F] hover:bg-[#467326] text-white text-xs font-medium rounded-r-[4px] transition-colors whitespace-nowrap">
                    {t('product.apply', 'Apply')}
                  </button>
                </form>
                {couponMessage && <p className="mt-2 text-[11px] text-green-700 font-medium">{couponMessage}</p>}
              </div>

              {/* Price Summary */}
              <div className="mt-4 bg-white p-4 border border-gray-200 rounded-xl">
                <h3 className="text-base font-bold text-gray-900 mb-0.5">{t('cart.priceSummary', 'Price Summary')}</h3>
                <p className="text-[11px] text-gray-500 mb-4">{t('cart.inclusiveTaxes', 'Prices are inclusive of all taxes')}</p>
                
                <div className="flex flex-col gap-3 text-sm text-gray-800">
                  <div className="flex justify-between">
                    <span>{t('cart.bagTotal', 'Bag Total')} ( {totalItems} {t('cart.items', 'items')} )</span>
                    <span className="font-semibold">{formatCurrency(bagTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('cart.discount', 'Discount on MRP')}</span>
                    <span className="font-semibold">-{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('cart.subTotal', 'Sub Total')}</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('cart.convenience', 'Convenience Charges')}</span>
                    <span className="text-green-700 font-medium">{t('cart.free', 'Free')}</span>
                  </div>
                  
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">{t('cart.youPay', 'You Pay')}</span>
                    <span className="text-base font-bold text-gray-900">{formatCurrency(youPay)}</span>
                  </div>
                </div>
              </div>

              {/* Full-width Check Out Button */}
              <div className="mt-5 px-2">
                <button
                  onClick={() => {
                    toggleCart(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-[#65C431] hover:bg-[#57B026] text-gray-900 font-semibold py-3 rounded-lg transition-colors text-sm"
                >
                  {t('cart.checkout', 'Check Out')}
                </button>
              </div>
            </>)}
        </div>
      </div>
    </>);
}
