import React, { useState } from 'react';
import { X, MapPin, Loader2, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LocationSelectorModal({ isOpen, onClose }) {
  const { updateLocation } = useAuth();
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  if (!isOpen) return null;

  const handleApplyPincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeError('Please enter a valid 6-digit pincode');
      return;
    }

    // Mock city lookup based on common pincodes
    let mockCity = 'India';
    const pin = pincode.trim();
    if (pin.startsWith('627')) mockCity = 'Tirunelveli';
    else if (pin.startsWith('600')) mockCity = 'Chennai';
    else if (pin.startsWith('110')) mockCity = 'New Delhi';
    else if (pin.startsWith('560')) mockCity = 'Bengaluru';
    else if (pin.startsWith('400')) mockCity = 'Mumbai';
    else if (pin.startsWith('500')) mockCity = 'Hyderabad';
    else if (pin.startsWith('695')) mockCity = 'Trivandrum';

    updateLocation({
      type: 'pincode',
      value: pin,
      text: `${mockCity} - ${pin}`,
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
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Real reverse geocoding via OpenStreetMap Nominatim (free, no API key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city =
            addr.city ||
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
        } catch {
          setPincodeError('Unable to fetch location details. Try entering a pincode manually.');
          setGeoLoading(false);
        }
      },
      (error) => {
        console.error(error);
        if (error.code === error.PERMISSION_DENIED) {
          setPincodeError('Location permission denied. Please allow access or enter a pincode.');
        } else {
          setPincodeError('Unable to retrieve your location. Try entering a pincode manually.');
        }
        setGeoLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden z-10 mx-4 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Choose your location
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Pincode Section */}
          <form onSubmit={handleApplyPincode} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500"
              />
              {pincodeError && (
                <p className="text-red-500 text-xs mt-1 absolute left-1">{pincodeError}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-2 rounded text-sm transition-colors h-fit"
            >
              Apply
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="px-3 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Geolocation Section */}
          <button
            onClick={handleDetectLocation}
            disabled={geoLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {geoLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                Detecting...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-green-600" />
                Detect My Location
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}