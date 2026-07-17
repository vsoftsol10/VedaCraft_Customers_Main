import { Edit2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
export default function AddressStep({ selectedAddressId, onSelectAddress, onAddAddress, onEditAddress, onDeleteAddress, onContinue, }) {
    const { t } = useTranslation();
    const { addresses } = useAuth();
    return (<div className="bg-white border border-gray-200 transition-all duration-300">
      {/* Section Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600"/>
          {t('checkout.deliveryAddress')}
        </h2>
        <button onClick={onAddAddress} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 text-gray-700 transition-colors">
          <Plus className="w-4 h-4"/>
          {t('checkout.addAddress')}
        </button>
      </div>

      {/* Address List */}
      <div className="p-5">
        {addresses.length === 0 ? (<div className="text-center py-10">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-green-600"/>
            </div>
            <p className="text-gray-500 mb-3">{t('checkout.noAddress')}</p>
            <button onClick={onAddAddress} className="text-green-600 font-medium hover:text-green-700 hover:underline transition-colors">
              {t('checkout.addNewAddress')}
            </button>
          </div>) : (<div className="space-y-3">
            {addresses.map((addr) => (<div key={addr.id} onClick={() => onSelectAddress(addr.id)} className={`flex gap-4 p-4 border rounded cursor-pointer transition-all duration-200 ${selectedAddressId === addr.id
                    ? 'border-green-500 bg-green-50/40 shadow-sm shadow-green-100'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}>
                <div className="pt-1">
                  <input type="radio" name="selectedAddress" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => onSelectAddress(addr.id)} className="accent-green-600 w-4 h-4"/>
                </div>
                <div className="flex-1 text-sm text-gray-800">
                  <p className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                    {addr.fullName}
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">
                      {addr.addressType}
                    </span>
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-1">
                    {addr.address}
                    {addr.landmark && `, ${addr.landmark}`}, {addr.city}
                  </p>
                  <p className="text-gray-600 mb-1">
                    {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-gray-800 font-medium mt-2">
                    {t('checkout.mobile')} {addr.phoneNumber}
                  </p>
                </div>
                <div className="flex flex-col gap-2 justify-center pl-2">
                  <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    onEditAddress(addr);
                }} className="p-2 text-gray-400 hover:text-green-600 hover:bg-white rounded transition-colors" aria-label="Edit address" title="Edit address">
                    <Edit2 className="w-4 h-4"/>
                  </button>
                  <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAddress(addr.id);
                }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded transition-colors" aria-label="Delete address" title="Delete address">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>))}
          </div>)}

        {/* Continue Button */}
        {addresses.length > 0 && selectedAddressId && (<div className="mt-6 flex justify-end">
            <button onClick={onContinue} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-10 rounded transition-all duration-200 shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-200 active:scale-[0.98]">
              {t('checkout.continue')}
            </button>
          </div>)}
      </div>
    </div>);
}
