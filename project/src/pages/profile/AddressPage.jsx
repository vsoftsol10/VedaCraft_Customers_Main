import { useState } from 'react';
import { MapPin, Plus, Home, Briefcase, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AddAddressDrawer from '../../components/Checkout/AddAddressDrawer';
import { useTranslation } from 'react-i18next';
export default function AddressPage() {
    const { t } = useTranslation();
    const { addresses, addAddress, deleteAddress, updateLocation } = useAuth();
    const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
    const handleSaveAddress = async (newAddress) => {
        try {
            const { id, ...addressDataToSave } = newAddress;
            const created = await addAddress(addressDataToSave);
            updateLocation({
                type: 'address',
                value: created.id,
                text: `${created.city} - ${created.pincode}`,
            });
            setIsAddressDrawerOpen(false);
        }
        catch (error) {
            console.error('Failed to add address:', error);
        }
    };
    return (<div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#2d6a2d]"/>
            <h3 className="text-base font-semibold text-gray-900">{t('addressPage.title')}</h3>
          </div>
          <button onClick={() => setIsAddressDrawerOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-[#2d6a2d]
                       text-[#2d6a2d] text-sm font-medium hover:bg-[#f0f5ec] transition-colors">
            <Plus className="w-4 h-4"/>
            {t('addressPage.addNew')}
          </button>
        </div>

        {addresses.length === 0 ? (<div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-500 font-medium">{t('addressPage.empty')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('addressPage.emptyDesc')}</p>
          </div>) : (<div className="flex flex-col gap-3">
            {addresses.map((addr) => (<div key={addr.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100
                           hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-full bg-[#f0f5ec] flex items-center justify-center flex-shrink-0">
                  {addr.addressType === 'Home'
                    ? <Home className="w-4 h-4 text-[#2d6a2d]"/>
                    : <Briefcase className="w-4 h-4 text-[#2d6a2d]"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{addr.fullName}</p>
                    <span className="text-xs bg-[#f0f5ec] text-[#2d6a2d] px-2 py-0.5 rounded-full font-medium">
                      {addr.addressType === 'Home' ? t('address.home') : addr.addressType === 'Work' ? t('address.work') : addr.addressType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {addr.address}{addr.landmark ? `, ${addr.landmark}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phoneNumber}</p>
                </div>
                <button onClick={() => deleteAddress(addr.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>))}
          </div>)}
      </div>
      <AddAddressDrawer isOpen={isAddressDrawerOpen} onClose={() => setIsAddressDrawerOpen(false)} onSave={handleSaveAddress}/>
    </div>);
}
