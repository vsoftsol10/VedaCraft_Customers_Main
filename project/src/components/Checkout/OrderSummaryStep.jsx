import { Star, Truck, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
// Generate a mock delivery date 5-7 days from now
function getDeliveryDate() {
    const d = new Date();
    d.setDate(d.getDate() + 5 + Math.floor(Math.random() * 3));
    return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}
export default function OrderSummaryStep({ selectedAddress, items, onChangeAddress, onContinue, isBuyNow, }) {
    const { t } = useTranslation();
    const { updateQuantity, removeFromCart } = useCart();
    const deliveryDate = getDeliveryDate();
    return (<div className="space-y-4 transition-all duration-300">
      {/* Deliver To Header */}
      {selectedAddress && (<div className="bg-white border border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0"/>
            <div className="text-sm">
              <span className="text-gray-600">{t('checkout.deliverTo')} </span>
              <span className="font-semibold text-gray-900">{selectedAddress.fullName}</span>
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ml-2">
                {selectedAddress.addressType}
              </span>
              <p className="text-gray-500 mt-1 leading-relaxed">
                {selectedAddress.address}
                {selectedAddress.landmark && `, ${selectedAddress.landmark}`},{' '}
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </p>
              <p className="text-gray-700 font-medium mt-1">{selectedAddress.phoneNumber}</p>
            </div>
          </div>
          <button onClick={onChangeAddress} className="text-green-600 hover:text-green-700 text-sm font-semibold flex-shrink-0 border border-green-200 px-3 py-1.5 rounded hover:bg-green-50 transition-colors">
            {t('checkout.change')}
          </button>
        </div>)}

      {/* Product Items */}
      {items.map((item) => {
            const originalPrice = Math.round(item.price * 2);
            const discountPercent = Math.round(((originalPrice - item.price) / originalPrice) * 100);
            return (<div key={item.id} className="bg-white border border-gray-200 p-5 transition-all duration-200 hover:shadow-sm">
            <div className="flex gap-4">
              {/* Product Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 border border-gray-100 rounded overflow-hidden bg-gray-50">
                <img src={item.image} alt={t(`productsData.${item.name}`, item.name)} className="w-full h-full object-cover"/>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 line-clamp-2">
                  {t(`productsData.${item.name}`, item.name)}
                </h3>

                {/* Rating */}
                {item.rating && (<div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center bg-green-700 text-white text-[11px] px-1.5 py-0.5 rounded font-medium gap-0.5">
                      {item.rating}
                      <Star className="w-2.5 h-2.5 fill-white"/>
                    </div>
                  </div>)}

                {/* Quantity Selector */}
                <div className="flex items-center gap-2 mb-3">
                  <label htmlFor={`qty-${item.id}`} className="text-xs text-gray-500">
                    Qty:
                  </label>
                  <select id={`qty-${item.id}`} value={item.quantity} onChange={(e) => {
                    const newQty = parseInt(e.target.value);
                    if (newQty === 0) {
                        if (!isBuyNow)
                            removeFromCart(item.id);
                    }
                    else {
                        if (!isBuyNow)
                            updateQuantity(item.id, newQty);
                    }
                }} disabled={isBuyNow} className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-green-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (<option key={num} value={num}>
                        {num}
                      </option>))}
                  </select>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-green-700 font-bold text-sm">
                    ↓{discountPercent}%
                  </span>
                  <span className="text-gray-400 line-through text-xs">
                    &#8377;{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="font-bold text-gray-900 text-base">
                    &#8377;{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Estimate */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
              <Truck className="w-4 h-4 text-green-600"/>
              <span>
                {t('checkout.deliveryBy')}{' '}
                <span className="font-semibold text-gray-800">{deliveryDate}</span>
              </span>
              <span className="text-green-600 font-medium ml-1">
                | {t('checkout.freeDelivery')}
              </span>
            </div>
          </div>);
        })}

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <button onClick={onContinue} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-10 rounded transition-all duration-200 shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-200 active:scale-[0.98]">
          {t('checkout.continue')}
        </button>
      </div>
    </div>);
}
