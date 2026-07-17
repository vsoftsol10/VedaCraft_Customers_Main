import { useNavigate } from 'react-router-dom';
import { Trash2, Star, ChevronLeft, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
export default function CartDrawer() {
    const { t } = useTranslation();
    const { items, isOpen, toggleCart, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();
    if (!isOpen)
        return null;
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    // Assuming a 50% discount on MRP for illustration to match the design style
    const bagTotal = items.reduce((acc, item) => acc + (item.price * 2) * item.quantity, 0);
    const discount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const youPay = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return (<>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[99] transition-opacity" onClick={() => toggleCart(false)}/>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[100] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-100">
          <button onClick={() => toggleCart(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
            <ChevronLeft className="w-5 h-5"/>
          </button>
          <h2 className="text-lg font-bold text-gray-900">{t('cart.title')}</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {items.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <p>{t('cart.empty')}</p>
              <button onClick={() => toggleCart(false)} className="text-green-600 font-medium hover:underline">
                {t('cart.continueShopping')}
              </button>
            </div>) : (<div className="flex flex-col gap-4">
              {items.map((item) => (<div key={item.id} className="bg-white p-3 border border-gray-200 rounded-sm">
                  <div className="flex gap-4 relative">
                    <img src={item.image} alt={t(`productsData.${item.name}`, item.name)} className="w-20 h-20 object-cover rounded-sm border border-gray-100"/>
                    
                    <div className="flex-1 pr-8">
                      <h3 className="text-sm font-medium text-gray-900 leading-tight mb-1">{t(`productsData.${item.name}`, item.name)}</h3>
                      {item.rating && (<div className="flex items-center gap-0.5 mb-2">
                          <span className="text-[10px] text-gray-600 font-medium">{item.rating}</span>
                          <Star className="w-3 h-3 fill-green-600 text-green-600"/>
                        </div>)}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2 text-xs">{t('cart.quantity')} :</span>
                        <div className="flex items-center gap-3 border border-gray-300 rounded px-2 py-0.5">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-500 hover:text-gray-800">
                            <Minus className="w-3 h-3"/>
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-500 hover:text-gray-800">
                            <Plus className="w-3 h-3"/>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => removeFromCart(item.id)} className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">{t('cart.amount')}</span>
                    <span className="text-sm font-bold text-gray-900">&#8377;{item.price * item.quantity}</span>
                  </div>
                </div>))}
            </div>)}

          {/* Price Summary */}
          {items.length > 0 && (<div className="mt-6 bg-white p-4 border border-gray-200 rounded-sm">
              <h3 className="font-bold text-gray-900 mb-1">{t('cart.priceSummary')}</h3>
              <p className="text-[10px] text-gray-500 mb-4">{t('cart.inclusiveTaxes')}</p>
              
              <div className="flex flex-col gap-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>{t('cart.bagTotal')} ( {totalItems} {t('cart.items')} )</span>
                  <span className="font-medium">&#8377;{bagTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.discount')}</span>
                  <span className="font-medium">-&#8377; {discount}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.subTotal')}</span>
                  <span className="font-medium">-&#8377; {discount}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.convenience')}</span>
                  <span className="text-green-600 font-medium">{t('cart.free')}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-center">
                  <span className="font-bold text-gray-900">{t('cart.youPay')}</span>
                  <span className="font-bold text-gray-900">&#8377;{youPay}</span>
                </div>
              </div>
            </div>)}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (<div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
            <div className="font-bold text-gray-900">&#8377; {youPay}</div>
            <button onClick={() => {
                toggleCart(false);
                navigate('/checkout');
            }} className="bg-[#6cc24a] hover:bg-[#5db33e] text-white font-semibold py-2.5 px-8 rounded transition-colors text-sm">
              {t('cart.checkout')}
            </button>
          </div>)}
      </div>
    </>);
}
