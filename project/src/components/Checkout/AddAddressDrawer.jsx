import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

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
    const [locating, setLocating] = useState(false);

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
            setFormData(emptyAddressForm);
            setErrors({});
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const addr = data?.address || {};
                    setFormData((prev) => ({
                        ...prev,
                        pincode: addr.postcode || prev.pincode,
                        city: addr.city || addr.town || addr.village || addr.state_district || prev.city,
                        state: addr.state || prev.state,
                    }));
                } catch (err) {
                    console.warn('Location lookup failed:', err);
                } finally {
                    setLocating(false);
                }
            },
            () => setLocating(false),
            { timeout: 8000 }
        );
    };

    return (<>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[99] transition-opacity" onClick={onClose}/>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-[100] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center px-5 py-4 bg-white">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2.5 text-gray-800">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {initialAddress ? t('address.editTitle', 'Edit Address') : t('address.title', 'Add Address')}
          </h2>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-5 pb-4 space-y-4 flex-1">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">{t('address.fullName', 'Full Name')}</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t('address.fullNamePlaceholder', 'Enter Full Name')}
                className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-600`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Phone number */}
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">{t('address.phoneNumber', 'Phone number')}</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder={t('address.phoneNumberPlaceholder', 'Enter Phone number')}
                className={`w-full border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-600`}
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>

            {/* Pincode + Use my location */}
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">{t('address.pincode', 'Pincode')}</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder={t('address.pincodePlaceholder', 'Enter Pincode')}
                  className={`flex-1 min-w-0 border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-md px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-600`}
                />
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-[#65A30D] rounded-md text-xs font-medium text-[#4D7C0F] hover:bg-green-50 transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  <MapPin className="w-3.5 h-3.5"/>
                  {locating ? 'Locating...' : 'Use my location'}
                </button>
              </div>
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">{t('address.address', 'Address')}</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t('address.addressPlaceholder', 'House no, Building,street,area')}
                rows={3}
                className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-600 resize-none`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* Landmark ( Optional ) */}
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5">{t('address.landmark', 'Landmark ( Optional )')}</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder={t('address.landmarkPlaceholder', 'Enter Landmark')}
                className="w-full border border-gray-300 rounded-md px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-600"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1.5">{t('address.city', 'City')}</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t('address.cityPlaceholder', 'Enter City')}
                  className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-green-600`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1.5">{t('address.state', 'State')}</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2.5 text-sm bg-white ${formData.state ? 'text-gray-900' : 'text-gray-400'} focus:outline-none focus:border-green-600`}
                >
                  <option value="">{t('address.statePlaceholder', 'Select State')}</option>
                  {formData.state && !INDIAN_STATES.includes(formData.state) && (
                    <option value={formData.state}>{formData.state}</option>
                  )}
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} className="text-gray-900">{st}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
            </div>

            {/* Address Type */}
            <div className="pt-1">
              <label className="block text-xs font-medium text-gray-800 mb-2">{t('address.addressType', 'Address Type')}</label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {['Home', 'Work', 'Office'].map((type) => {
                  const selected = formData.addressType === type;
                  return (
                    <label
                      key={type}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] border text-xs cursor-pointer transition-colors ${
                        selected
                          ? 'border-[#4CAF50] bg-[#F1F8E9] text-[#2E7D32] font-semibold'
                          : 'border-[#4CAF50] bg-white text-[#2E7D32] hover:bg-[#F9FBF7]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="addressType"
                        value={type}
                        checked={selected}
                        onChange={handleChange}
                        className="accent-[#2E7D32] w-3 h-3"
                      />
                      <span>{type === 'Home' ? t('address.home', 'Home') : type === 'Work' ? t('address.work', 'Work') : type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="px-5 py-4 bg-white flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-400 rounded-md text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors">
              {t('address.cancel', 'Cancel')}
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-[#F7C61F] hover:bg-[#E5B515] text-gray-900 rounded-md text-sm font-semibold transition-colors">
              {t('address.save', 'Save Address')}
            </button>
          </div>
        </form>

      </div>
    </>);
}
