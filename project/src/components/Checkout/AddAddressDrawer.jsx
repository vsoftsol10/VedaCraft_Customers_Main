import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const emptyAddressForm = {
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'Home',
};
export default function AddAddressDrawer({ isOpen, onClose, onSave, initialAddress }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(emptyAddressForm);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (!isOpen)
            return;
        if (initialAddress) {
            const { id, ...addressData } = initialAddress;
            setFormData(addressData);
        }
        else {
            setFormData(emptyAddressForm);
        }
        setErrors({});
    }, [initialAddress, isOpen]);
    if (!isOpen)
        return null;
    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim())
            newErrors.fullName = t('address.requiredFullName');
        if (!formData.phoneNumber.trim())
            newErrors.phoneNumber = t('address.requiredPhone');
        if (!formData.address.trim())
            newErrors.address = t('address.requiredAddress');
        if (!formData.city.trim())
            newErrors.city = t('address.requiredCity');
        if (!formData.state.trim())
            newErrors.state = t('address.requiredState');
        if (!formData.pincode.trim())
            newErrors.pincode = t('address.requiredPincode');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave({
                ...formData,
                id: initialAddress?.id || Date.now().toString(),
            });
            // Reset form
            setFormData(emptyAddressForm);
            setErrors({});
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };
    return (<>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[99] transition-opacity" onClick={onClose}/>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white z-[100] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center p-6 border-b border-gray-100">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-3 text-gray-800">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <h2 className="text-xl font-medium text-gray-900">
            {initialAddress ? t('address.editTitle') : t('address.title')}
          </h2>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-6 space-y-6 flex-1">
            
            {/* Full Name & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-800 mb-2">{t('address.fullName')}</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder={t('address.fullNamePlaceholder')} className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded p-3 text-sm focus:outline-none focus:border-gray-400`}/>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-800 mb-2">{t('address.phoneNumber')}</label>
                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder={t('address.phoneNumberPlaceholder')} className={`w-full border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded p-3 text-sm focus:outline-none focus:border-gray-400`}/>
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm text-gray-800 mb-2">{t('address.address')}</label>
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder={t('address.addressPlaceholder')} rows={3} className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded p-3 text-sm focus:outline-none focus:border-gray-400 resize-none`}/>
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-800 mb-2">{t('address.city')}</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder={t('address.cityPlaceholder')} className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded p-3 text-sm focus:outline-none focus:border-gray-400`}/>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-800 mb-2">{t('address.state')}</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder={t('address.statePlaceholder')} className={`w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded p-3 text-sm focus:outline-none focus:border-gray-400`}/>
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
            </div>

            {/* Pincode & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-800 mb-2">{t('address.pincode')}</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder={t('address.pincodePlaceholder')} className={`w-full border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded p-3 text-sm focus:outline-none focus:border-gray-400`}/>
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-800 mb-2">{t('address.landmark')}</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder={t('address.landmarkPlaceholder')} className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-gray-400"/>
              </div>
            </div>

            {/* Address type */}
            <div>
              <label className="block text-sm text-gray-800 mb-3">{t('address.addressType')}</label>
              <div className="flex items-center gap-6 border border-gray-300 rounded p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="addressType" value="Home" checked={formData.addressType === 'Home'} onChange={handleChange} className="accent-gray-800 w-4 h-4"/>
                  <span className="text-sm text-gray-700">{t('address.home')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="addressType" value="Work" checked={formData.addressType === 'Work'} onChange={handleChange} className="accent-gray-800 w-4 h-4"/>
                  <span className="text-sm text-gray-700">{t('address.work')}</span>
                </label>
              </div>
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t border-gray-100 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded text-gray-800 font-medium hover:bg-gray-50 transition-colors">
              {t('address.cancel')}
            </button>
            <button type="submit" className="flex-1 py-3 bg-[#f5b027] hover:bg-[#e09e20] text-white rounded font-medium transition-colors">
              {t('address.save')}
            </button>
          </div>
        </form>

      </div>
    </>);
}
