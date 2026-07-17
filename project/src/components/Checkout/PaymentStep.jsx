import { useState } from 'react';
import { Banknote, Smartphone, CreditCard, Landmark, Wallet, ChevronDown, ChevronUp, MapPin, Package, Check, } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const paymentMethods = [
    {
        id: 'cod',
        titleKey: 'checkout.cashOnDelivery',
        descKey: 'checkout.codDesc',
        icon: Banknote,
    },
    {
        id: 'upi',
        titleKey: 'checkout.upi',
        descKey: 'checkout.upiDesc',
        icon: Smartphone,
    },
    {
        id: 'card',
        titleKey: 'checkout.creditDebitCard',
        descKey: 'checkout.cardDesc',
        icon: CreditCard,
    },
    {
        id: 'netbanking',
        titleKey: 'checkout.netBanking',
        descKey: 'checkout.netBankingDesc',
        icon: Landmark,
    },
    {
        id: 'wallet',
        titleKey: 'checkout.wallets',
        descKey: 'checkout.walletsDesc',
        icon: Wallet,
    },
];
const banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank',
];
const wallets = ['Paytm', 'PhonePe', 'Amazon Pay', 'Freecharge', 'MobiKwik'];
export default function PaymentStep({ selectedAddress, items, onChangeAddress, onChangeSummary, selectedPayment, onSelectPayment, }) {
    const { t } = useTranslation();
    const [expandedMethod, setExpandedMethod] = useState(selectedPayment || 'cod');
    const toggleExpand = (id) => {
        setExpandedMethod((prev) => (prev === id ? null : id));
    };
    const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
    return (<div className="space-y-4 transition-all duration-300">
      {/* Collapsed Address Header */}
      {selectedAddress && (<div className="bg-white border border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600 min-w-0">
            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0"/>
            <span className="truncate">
              {t('checkout.deliverTo')}{' '}
              <span className="font-semibold text-gray-900">
                {selectedAddress.fullName}
              </span>
              , {selectedAddress.city} - {selectedAddress.pincode}
            </span>
          </div>
          <button onClick={onChangeAddress} className="text-green-600 hover:text-green-700 text-sm font-semibold flex-shrink-0 border border-green-200 px-3 py-1.5 rounded hover:bg-green-50 transition-colors ml-3">
            {t('checkout.change')}
          </button>
        </div>)}

      {/* Collapsed Order Summary Header */}
      <div className="bg-white border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Package className="w-4 h-4 text-green-600 flex-shrink-0"/>
          <span>
            {t('checkout.stepOrderSummary')} —{' '}
            <span className="font-semibold text-gray-900">
              {itemCount} {t('checkout.items')}
            </span>
          </span>
        </div>
        <button onClick={onChangeSummary} className="text-green-600 hover:text-green-700 text-sm font-semibold flex-shrink-0 border border-green-200 px-3 py-1.5 rounded hover:bg-green-50 transition-colors ml-3">
          {t('checkout.change')}
        </button>
      </div>

      {/* Payment Methods */}
      <div className="bg-white border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600"/>
            {t('checkout.paymentMethod')}
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isExpanded = expandedMethod === method.id;
            const isSelected = selectedPayment === method.id;
            return (<div key={method.id} className="transition-all duration-200">
                {/* Method Header */}
                <button onClick={() => toggleExpand(method.id)} className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left ${isExpanded ? 'bg-green-50/30' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {t(method.titleKey)}
                        {isSelected && (<span className="flex items-center gap-1 text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                            <Check className="w-3 h-3"/>
                            {t('checkout.selectedPayment')}
                          </span>)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t(method.descKey)}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (<ChevronUp className="w-4 h-4 text-gray-400"/>) : (<ChevronDown className="w-4 h-4 text-gray-400"/>)}
                </button>

                {/* Expanded Content */}
                {isExpanded && (<div className="px-5 pb-5 pt-1 bg-gray-50/50 border-t border-gray-100">
                    {/* COD */}
                    {method.id === 'cod' && (<div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Pay cash when your order is delivered to your doorstep.
                          No advance payment needed.
                        </p>
                        <button onClick={() => onSelectPayment('cod')} className={`w-full py-2.5 rounded text-sm font-semibold transition-all duration-200 ${isSelected
                            ? 'bg-green-600 text-white shadow-md shadow-green-200'
                            : 'bg-white border border-green-500 text-green-700 hover:bg-green-50'}`}>
                          {isSelected ? '✓ Selected' : 'Select Cash on Delivery'}
                        </button>
                      </div>)}

                    {/* UPI */}
                    {method.id === 'upi' && (<div className="space-y-3">
                        <input type="text" placeholder={t('checkout.upiIdPlaceholder')} className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200"/>
                        <button onClick={() => onSelectPayment('upi')} className={`w-full py-2.5 rounded text-sm font-semibold transition-all duration-200 ${isSelected
                            ? 'bg-green-600 text-white shadow-md shadow-green-200'
                            : 'bg-white border border-green-500 text-green-700 hover:bg-green-50'}`}>
                          {isSelected ? '✓ Selected' : 'Verify & Select UPI'}
                        </button>
                      </div>)}

                    {/* Credit / Debit Card */}
                    {method.id === 'card' && (<div className="space-y-3">
                        <input type="text" placeholder={t('checkout.cardNumberPlaceholder')} className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200"/>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder={t('checkout.expiryPlaceholder')} className="border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200"/>
                          <input type="text" placeholder={t('checkout.cvvPlaceholder')} className="border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200"/>
                        </div>
                        <input type="text" placeholder={t('checkout.nameOnCardPlaceholder')} className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200"/>
                        <button onClick={() => onSelectPayment('card')} className={`w-full py-2.5 rounded text-sm font-semibold transition-all duration-200 ${isSelected
                            ? 'bg-green-600 text-white shadow-md shadow-green-200'
                            : 'bg-white border border-green-500 text-green-700 hover:bg-green-50'}`}>
                          {isSelected ? '✓ Selected' : 'Use this Card'}
                        </button>
                      </div>)}

                    {/* Net Banking */}
                    {method.id === 'netbanking' && (<div className="space-y-3">
                        <p className="text-xs text-gray-500 mb-1">
                          {t('checkout.selectBank')}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {banks.map((bank) => (<button key={bank} onClick={() => onSelectPayment('netbanking')} className="text-left text-sm px-3 py-2.5 border border-gray-200 rounded hover:border-green-400 hover:bg-green-50/50 transition-colors text-gray-700">
                              {bank}
                            </button>))}
                        </div>
                      </div>)}

                    {/* Wallets */}
                    {method.id === 'wallet' && (<div className="space-y-2">
                        {wallets.map((w) => (<button key={w} onClick={() => onSelectPayment('wallet')} className="w-full flex items-center justify-between text-sm px-4 py-3 border border-gray-200 rounded hover:border-green-400 hover:bg-green-50/50 transition-colors text-gray-700">
                            <span>{w}</span>
                            <span className="text-gray-400 text-xs">→</span>
                          </button>))}
                      </div>)}
                  </div>)}
              </div>);
        })}
        </div>
      </div>
    </div>);
}
