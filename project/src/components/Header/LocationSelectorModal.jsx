import React, { useState } from 'react';
import { X, MapPin, Plus, Trash2, Edit2, Loader2, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
export default function LocationSelectorModal({ isOpen, onClose }) {
    const { user, addresses, addAddress, updateAddress, deleteAddress, selectedLocation, updateLocation } = useAuth();
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const [pincode, setPincode] = useState('');
    const [pincodeError, setPincodeError] = useState('');
    const [geoLoading, setGeoLoading] = useState(false);
    // Address editing and creation states
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editAddressData, setEditAddressData] = useState({});
    const [addressErrors, setAddressErrors] = useState({});
    const [saveError, setSaveError] = useState('');
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    if (!isOpen)
        return null;
    const handleSignInRedirect = () => {
        onClose();
        const currentPath = encodeURIComponent(routerLocation.pathname + routerLocation.search);
        navigate(`/login?redirect=${currentPath}`);
    };
    const handleApplyPincode = (e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(pincode.trim())) {
            setPincodeError('Please enter a valid 6-digit pincode');
            return;
        }
        // Mock city lookup based on common pincodes
        let mockCity = 'India';
        const pin = pincode.trim();
        if (pin.startsWith('627'))
            mockCity = 'Tirunelveli';
        else if (pin.startsWith('600'))
            mockCity = 'Chennai';
        else if (pin.startsWith('110'))
            mockCity = 'New Delhi';
        else if (pin.startsWith('560'))
            mockCity = 'Bengaluru';
        else if (pin.startsWith('400'))
            mockCity = 'Mumbai';
        else if (pin.startsWith('500'))
            mockCity = 'Hyderabad';
        else if (pin.startsWith('695'))
            mockCity = 'Trivandrum';
        updateLocation({
            type: 'pincode',
            value: pin,
            text: `${mockCity} - ${pin}`
        });
        setPincodeError('');
        onClose();
    };
    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setPincodeError('Geolocation is not supported by your browser');
            return;
        }
        setGeoLoading(true);
        setPincodeError('');
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Real reverse geocoding via OpenStreetMap Nominatim (free, no API key needed)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`, { headers: { 'Accept-Language': 'en' } });
                const data = await res.json();
                const addr = data.address || {};
                const city = addr.city ||
                    addr.town ||
                    addr.village ||
                    addr.county ||
                    addr.state_district ||
                    addr.state ||
                    'India';
                const pincode = addr.postcode || '000000';
                updateLocation({
                    type: 'pincode',
                    value: pincode,
                    text: `${city} - ${pincode}`,
                });
                setGeoLoading(false);
                onClose();
            }
            catch {
                setPincodeError('Unable to fetch location details. Try entering a pincode manually.');
                setGeoLoading(false);
            }
        }, (error) => {
            console.error(error);
            if (error.code === error.PERMISSION_DENIED) {
                setPincodeError('Location permission denied. Please allow access or enter a pincode.');
            }
            else {
                setPincodeError('Unable to retrieve your location. Try entering a pincode manually.');
            }
            setGeoLoading(false);
        }, { timeout: 10000, enableHighAccuracy: false });
    };
    const handleSelectAddress = (addr) => {
        updateLocation({
            type: 'address',
            value: addr.id,
            text: `${addr.city} - ${addr.pincode}`
        });
        onClose();
    };
    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setSaveError('');
        if (isSavingAddress)
            return;
        const errors = {};
        if (!editAddressData.fullName?.trim())
            errors.fullName = 'Full Name is required';
        if (!editAddressData.phoneNumber?.trim())
            errors.phoneNumber = 'Phone Number is required';
        if (!editAddressData.address?.trim())
            errors.address = 'Address is required';
        if (!editAddressData.city?.trim())
            errors.city = 'City is required';
        if (!editAddressData.state?.trim())
            errors.state = 'State is required';
        if (!editAddressData.pincode?.trim() || !/^\d{6}$/.test(editAddressData.pincode)) {
            errors.pincode = 'Valid 6-digit Pincode is required';
        }
        if (Object.keys(errors).length > 0) {
            setAddressErrors(errors);
            return;
        }
        const finalAddr = {
            fullName: editAddressData.fullName || '',
            phoneNumber: editAddressData.phoneNumber || '',
            address: editAddressData.address || '',
            city: editAddressData.city || '',
            state: editAddressData.state || '',
            pincode: editAddressData.pincode || '',
            landmark: editAddressData.landmark || '',
            addressType: editAddressData.addressType || 'Home',
        };
        setIsSavingAddress(true);
        try {
            if (isEditing && editAddressData.id) {
                await updateAddress({
                    ...finalAddr,
                    id: editAddressData.id,
                });
                updateLocation({
                    type: 'address',
                    value: editAddressData.id,
                    text: `${finalAddr.city} - ${finalAddr.pincode}`
                });
            }
            else {
                const created = await addAddress(finalAddr);
                // Auto select the new address
                updateLocation({
                    type: 'address',
                    value: created.id,
                    text: `${created.city} - ${created.pincode}`
                });
            }
            setIsEditing(false);
            setIsAdding(false);
            setEditAddressData({});
            setAddressErrors({});
        }
        catch (error) {
            console.error('Failed to save address:', error);
            setSaveError(error instanceof Error ? error.message : 'Failed to save address');
        }
        finally {
            setIsSavingAddress(false);
        }
    };
    const startEditAddress = (addr) => {
        setEditAddressData(addr);
        setIsEditing(true);
        setIsAdding(false);
        setSaveError('');
    };
    const startAddAddress = () => {
        setEditAddressData({ addressType: 'Home' });
        setIsAdding(true);
        setIsEditing(false);
        setSaveError('');
    };
    return (<div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Dark Amazon-style overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] transition-opacity duration-300" onClick={onClose}/>

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden z-10 mx-4 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600"/>
            Choose your location
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">

          {/* Inline Address Creation / Modification Form */}
          {(isAdding || isEditing) ? (<form onSubmit={handleSaveAddress} className="space-y-4">
              <h4 className="font-bold text-sm text-[#1c6b32]">
                {isEditing ? 'Edit Delivery Address' : 'Add New Address'}
              </h4>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                  <input type="text" value={editAddressData.fullName || ''} onChange={e => setEditAddressData(p => ({ ...p, fullName: e.target.value }))} className="w-full border border-gray-300 rounded p-2"/>
                  {addressErrors.fullName && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.fullName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                    <input type="text" value={editAddressData.phoneNumber || ''} onChange={e => setEditAddressData(p => ({ ...p, phoneNumber: e.target.value }))} className="w-full border border-gray-300 rounded p-2"/>
                    {addressErrors.phoneNumber && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.phoneNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Pincode</label>
                    <input type="text" value={editAddressData.pincode || ''} onChange={e => setEditAddressData(p => ({ ...p, pincode: e.target.value }))} className="w-full border border-gray-300 rounded p-2" placeholder="6-digit pincode"/>
                    {addressErrors.pincode && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.pincode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Address Detail</label>
                  <input type="text" value={editAddressData.address || ''} onChange={e => setEditAddressData(p => ({ ...p, address: e.target.value }))} className="w-full border border-gray-300 rounded p-2" placeholder="House no, Street, Area"/>
                  {addressErrors.address && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">City</label>
                    <input type="text" value={editAddressData.city || ''} onChange={e => setEditAddressData(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-300 rounded p-2"/>
                    {addressErrors.city && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">State</label>
                    <input type="text" value={editAddressData.state || ''} onChange={e => setEditAddressData(p => ({ ...p, state: e.target.value }))} className="w-full border border-gray-300 rounded p-2"/>
                    {addressErrors.state && <p className="text-red-500 text-[10px] mt-0.5">{addressErrors.state}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Landmark</label>
                    <input type="text" value={editAddressData.landmark || ''} onChange={e => setEditAddressData(p => ({ ...p, landmark: e.target.value }))} className="w-full border border-gray-300 rounded p-2"/>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Type</label>
                    <select value={editAddressData.addressType || 'Home'} onChange={e => setEditAddressData(p => ({ ...p, addressType: e.target.value }))} className="w-full border border-gray-300 rounded p-2 bg-white">
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => {
                setIsAdding(false);
                setIsEditing(false);
                setSaveError('');
            }} disabled={isSavingAddress} className="flex-1 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingAddress} className="flex-1 py-2 bg-[#f5b027] hover:bg-[#e09e20] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded text-sm transition-colors flex items-center justify-center gap-2">
                  {isSavingAddress && <Loader2 className="w-4 h-4 animate-spin"/>}
                  {isSavingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
              {saveError && <p className="text-red-500 text-xs">{saveError}</p>}
            </form>) : (<>
              {/* Authenticated flow: User Addresses */}
              {user ? (<div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select delivery address</span>
                    <button onClick={startAddAddress} className="text-xs text-green-600 hover:text-green-800 font-bold flex items-center gap-1 transition-colors">
                      <Plus className="w-3.5 h-3.5"/> Add Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (<p className="text-sm text-gray-500 bg-gray-50 p-4 border border-dashed border-gray-200 rounded text-center">
                      No addresses saved yet. Add one above!
                    </p>) : (<div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {addresses.map((addr) => {
                        const isSelected = selectedLocation.type === 'address' && selectedLocation.value === addr.id;
                        return (<div key={addr.id} className={`flex gap-3 p-3 border rounded-lg transition-colors cursor-pointer ${isSelected
                                ? 'border-green-500 bg-green-50/10'
                                : 'border-gray-200 hover:border-gray-300'}`} onClick={() => handleSelectAddress(addr)}>
                            <input type="radio" name="modal_selected_address" checked={isSelected} onChange={() => handleSelectAddress(addr)} className="accent-green-600 mt-1"/>
                            <div className="flex-1 text-xs text-gray-700">
                              <p className="font-bold text-gray-900 flex items-center gap-2 mb-0.5">
                                {addr.fullName}
                                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold">
                                  {addr.addressType}
                                </span>
                              </p>
                              <p className="text-gray-500">{addr.address}, {addr.city}</p>
                              <p className="text-gray-500">{addr.state} - {addr.pincode}</p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex flex-col gap-2 justify-center pl-2">
                              <button onClick={(e) => {
                                e.stopPropagation();
                                startEditAddress(addr);
                            }} className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                                <Edit2 className="w-3.5 h-3.5"/>
                              </button>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(addr.id);
                            }} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5"/>
                              </button>
                            </div>
                          </div>);
                    })}
                    </div>)}
                </div>) : (
            /* Unauthenticated flow: Sign-in Section */
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center shadow-inner">
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Select a delivery location to see product availability and delivery options.
                  </p>
                  <button onClick={handleSignInRedirect} className="w-full bg-[#f5b027] hover:bg-[#e09e20] text-white font-bold py-2.5 px-4 rounded-lg shadow transition-colors text-sm">
                    Sign in to see your addresses
                  </button>
                </div>)}

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="px-3 bg-white text-gray-400">or enter a pincode</span>
                </div>
              </div>

              {/* Pincode Section */}
              <form onSubmit={handleApplyPincode} className="flex gap-2">
                <div className="flex-1 relative">
                  <input type="text" placeholder="Enter pincode" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500"/>
                  {pincodeError && <p className="text-red-500 text-xs mt-1 absolute left-1">{pincodeError}</p>}
                </div>
                <button type="submit" className="bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-2 rounded text-sm transition-colors h-fit">
                  Apply
                </button>
              </form>

              {/* Geolocation Section */}
              <div className="pt-4 border-t border-gray-100">
                <button onClick={handleDetectLocation} disabled={geoLoading} className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  {geoLoading ? (<>
                      <Loader2 className="w-4 h-4 animate-spin text-green-600"/>
                      Detecting...
                    </>) : (<>
                      <Navigation className="w-4 h-4 text-green-600"/>
                      Detect My Location
                    </>)}
                </button>
              </div>
            </>)}

        </div>
      </div>
    </div>);
}
