import { useState } from 'react';
import { MapPin, Plus, Home, Briefcase, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AddAddressDrawer from '../../components/Checkout/AddAddressDrawer';
import { useTranslation } from 'react-i18next';

export default function AddressPage() {
  const { t } = useTranslation();
  const { addresses, addAddress, updateAddress, deleteAddress, updateLocation } = useAuth();
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null = add mode, object = edit mode

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsAddressDrawerOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setIsAddressDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsAddressDrawerOpen(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      if (editingAddress) {
        // Edit mode - update existing address
        const updated = {
          ...addressData,
          id: editingAddress.id,
          is_default: editingAddress.is_default,
        };
        await updateAddress(updated);
        updateLocation({
          type: 'address',
          value: updated.id,
          text: `${updated.city} - ${updated.pincode}`,
        });
      } else {
        // Add mode - create new address
        const { id, ...addressDataToSave } = addressData;
        const created = await addAddress(addressDataToSave);
        updateLocation({
          type: 'address',
          value: created.id,
          text: `${created.city} - ${created.pincode}`,
        });
      }
      handleCloseDrawer();
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#2d6a2d]" />
            <h3 className="text-base font-semibold text-gray-900">{t('addressPage.title')}</h3>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-[#2d6a2d]
                       text-[#2d6a2d] text-sm font-medium hover:bg-[#f0f5ec] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('addressPage.addNew')}
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('addressPage.empty')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('addressPage.emptyDesc')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-100
                           hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-[#f0f5ec] flex items-center justify-center flex-shrink-0">
                  {addr.addressType === 'Home' ? (
                    <Home className="w-4 h-4 text-[#2d6a2d]" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-[#2d6a2d]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{addr.fullName}</p>
                    <span className="text-xs bg-[#f0f5ec] text-[#2d6a2d] px-2 py-0.5 rounded-full font-medium">
                      {addr.addressType === 'Home'
                        ? t('address.home')
                        : addr.addressType === 'Work'
                        ? t('address.work')
                        : addr.addressType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {addr.address}
                    {addr.landmark ? `, ${addr.landmark}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phoneNumber}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="p-1.5 text-gray-400 hover:text-[#2d6a2d] transition-colors"
                    aria-label={t('addressPage.edit', 'Edit')}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={t('addressPage.delete', 'Delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddAddressDrawer
        isOpen={isAddressDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveAddress}
        initialAddress={editingAddress}
      />
    </div>
  );
}
