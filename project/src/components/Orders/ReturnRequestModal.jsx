import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CornerDownLeft,
  Hash,
  ImagePlus,
  MapPin,
  Package,
  Plus,
  Receipt,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const RETURN_REASONS = [
  { id: 'Product Arrived damaged', key: 'returns.reasons.damaged', defaultLabel: 'Product Arrived damaged' },
  { id: 'Wrong product Received', key: 'returns.reasons.wrong', defaultLabel: 'Wrong product Received' },
  { id: 'Product is defective', key: 'returns.reasons.defective', defaultLabel: 'Product is defective' },
  { id: 'Product is different from description', key: 'returns.reasons.different', defaultLabel: 'Product is different from description' },
  { id: 'Missing items / part', key: 'returns.reasons.missing', defaultLabel: 'Missing items / part' },
  { id: 'Other', key: 'returns.reasons.other', defaultLabel: 'Other' },
];

function formatAddress(address) {
  if (!address) return null;
  const lines = [
    address.address,
    [address.landmark, address.city, address.state].filter(Boolean).join(', '),
    address.pincode ? `Pincode - ${address.pincode}` : '',
  ].filter(Boolean);

  return {
    name: address.fullName || 'Customer',
    phone: address.phoneNumber || address.phone || '',
    lines,
  };
}

// Steps:
// 1 = Select Return Reason
// 2 = Describe the Issue (only if "Other" selected)
// 3 = Product Condition & Photos
// 4 = Return Method & Pickup Address
// 5 = Review Return + Confirm & Submit

export default function ReturnRequestModal({ order, isSubmitting = false, onClose, onSubmit }) {
  const { t } = useTranslation();
  const { addresses = [] } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [returnMethod, setReturnMethod] = useState('pickup');
  const [isOriginalCondition, setIsOriginalCondition] = useState('yes');
  const [hasOriginalPackaging, setHasOriginalPackaging] = useState('yes');
  const [issueDescription, setIssueDescription] = useState('');
  const [confirmPolicy, setConfirmPolicy] = useState(false);
  const [selectedPickupAddress, setSelectedPickupAddress] = useState(order?.address || null);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [showCustomAddressForm, setShowCustomAddressForm] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    fullName: order?.address?.fullName || '',
    phoneNumber: order?.address?.phoneNumber || order?.address?.phone || '',
    address: order?.address?.address || '',
    landmark: order?.address?.landmark || '',
    city: order?.address?.city || '',
    state: order?.address?.state || '',
    pincode: order?.address?.pincode || '',
  });
  const [files, setFiles] = useState([]);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);
  const selectedFilesRef = useRef([]);

  useEffect(() => {
    setSelectedPickupAddress(order?.address || null);
  }, [order?.address]);

  useEffect(() => {
    selectedFilesRef.current = files;
  }, [files]);

  useEffect(() => () => {
    selectedFilesRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview));
  }, []);

  const addFiles = (selectedFiles) => {
    setImageError('');
    const incoming = Array.from(selectedFiles || []);
    if (!incoming.length) return;

    const available = MAX_IMAGES - files.length;
    if (available <= 0) {
      setImageError(t('returns.maxPhotosError', 'You can upload up to 5 photos.'));
      return;
    }

    const valid = [];
    for (const file of incoming.slice(0, available)) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setImageError(t('returns.invalidPhotoType', 'Photos must be JPG, PNG, or WebP files.'));
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setImageError(t('returns.maxPhotoSize', 'Each photo must be 5 MB or smaller.'));
        continue;
      }
      valid.push({ file, preview: URL.createObjectURL(file) });
    }

    if (incoming.length > available) {
      setImageError(t('returns.maxPhotosError', 'You can upload up to 5 photos.'));
    }

    if (valid.length) {
      setFiles((current) => [...current, ...valid]);
    }
  };

  const removeFile = (index) => {
    setFiles((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
    setImageError('');
  };

  const pickupAddress = useMemo(() => formatAddress(selectedPickupAddress), [selectedPickupAddress]);
  const hasOther = selectedReasons.includes('Other');
  const firstItem = Array.isArray(order?.items) ? order.items[0] : null;
  const orderProductName = order?.product || firstItem?.name || firstItem?.title || 'Product';
  const orderRefundAmount = order?.total ?? order?.amount ?? firstItem?.price ?? 0;
  const displayOrderId = order?.orderNumber || order?.order_number || order?.id || '';

  const canContinue =
    (step === 1 && selectedReasons.length > 0) ||
    (step === 2 && issueDescription.trim().length > 0) ||
    step === 3 ||
    step === 4 ||
    (step === 5 && confirmPolicy);

  const isLastStep = step === 5;

  const toggleReason = (reasonId) => {
    setSelectedReasons((current) =>
      current.includes(reasonId) ? current.filter((item) => item !== reasonId) : [...current, reasonId]
    );
  };

  const getNextStep = (currentStep) => {
    if (currentStep === 1) return hasOther ? 2 : 3;
    return currentStep + 1;
  };

  const getPrevStep = (currentStep) => {
    if (currentStep === 3 && !hasOther) return 1;
    return currentStep - 1;
  };

  const handleBack = () => {
    if (step === 1) {
      onClose();
      return;
    }
    setStep(getPrevStep(step));
  };

  const handleContinue = () => {
    if (!canContinue || isSubmitting) return;

    if (!isLastStep) {
      setStep(getNextStep(step));
      return;
    }

    onSubmit({
      reasons: selectedReasons,
      reason: selectedReasons.join(', '),
      returnMethod,
      pickupAddress: selectedPickupAddress || null,
      isOriginalCondition: isOriginalCondition === 'yes',
      hasOriginalPackaging: hasOriginalPackaging === 'yes',
      issueDescription: issueDescription.trim(),
      files: files.map(({ file }) => file),
      items: order?.items || [],
    });
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/35 px-4 py-6" onClick={onClose}>
      <div
        className="w-full max-w-[460px] rounded-lg border border-gray-200 bg-white p-4 sm:p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-request-title"
      >
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-2 text-xl font-bold text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          {step === 1 ? t('profile.cancel', 'Cancel') : t('returns.back', 'Back')}
        </button>

        {/* Step 1: Select Return Reason */}
        {step === 1 && (
          <div>
            <p className="mb-7 text-sm font-bold text-gray-900">ORDER ID#{order?.id}</p>
            <h2 id="return-request-title" className="mb-4 text-lg font-bold text-gray-900">
              {t('returns.selectReason', 'Why are you returning this product?')}
            </h2>
            <div className="space-y-2.5">
              {RETURN_REASONS.map((reason) => (
                <label key={reason.id} className="flex items-center gap-2 text-base font-medium text-gray-900">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason.id)}
                    onChange={() => toggleReason(reason.id)}
                    className="h-5 w-5 rounded border-gray-400 text-[#1f7a3a] focus:ring-[#1f7a3a]"
                  />
                  {t(reason.key, reason.defaultLabel)}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Describe the Issue (only when "Other" is selected) */}
        {step === 2 && (
          <div>
            <h2 id="return-request-title" className="mb-4 text-base font-bold text-gray-900">
              Describe the Issue
            </h2>
            <label className="mb-5 block text-base font-bold text-gray-900" htmlFor="return-issue">
              What is the issue?
            </label>
            <textarea
              id="return-issue"
              value={issueDescription}
              onChange={(event) => setIssueDescription(event.target.value)}
              placeholder="Please describe your issue in detail..."
              className="h-28 w-full resize-none rounded border border-gray-300 p-3 text-base text-gray-900 outline-none focus:border-[#1f7a3a] focus:ring-1 focus:ring-[#1f7a3a]"
            />
          </div>
        )}

        {/* Step 3: Product Condition */}
        {step === 3 && (
          <div>
            <h2 id="return-request-title" className="mb-4 text-base font-bold text-gray-900">
              Product Condition
            </h2>
            <div className="space-y-7 pl-5">
              <div>
                <p className="mb-4 text-base font-medium text-gray-900">
                  Is the product used and in its original condition?
                </p>
                {['yes', 'no'].map((value) => (
                  <label key={value} className="mb-2 flex items-center gap-2 text-sm font-medium text-[#2d6a2d]">
                    <input
                      type="radio"
                      name="original-condition"
                      value={value}
                      checked={isOriginalCondition === value}
                      onChange={() => setIsOriginalCondition(value)}
                      className="h-4 w-4 text-[#1f7a3a] focus:ring-[#1f7a3a]"
                    />
                    {value === 'yes' ? 'Yes' : 'No'}
                  </label>
                ))}
              </div>
              <div>
                <p className="mb-4 text-base font-medium text-gray-900">
                  Does the product have its original packaging?
                </p>
                {['yes', 'no'].map((value) => (
                  <label key={value} className="mb-2 flex items-center gap-2 text-sm font-medium text-[#2d6a2d]">
                    <input
                      type="radio"
                      name="original-packaging"
                      value={value}
                      checked={hasOriginalPackaging === value}
                      onChange={() => setHasOriginalPackaging(value)}
                      className="h-4 w-4 text-[#1f7a3a] focus:ring-[#1f7a3a]"
                    />
                    {value === 'yes' ? 'Yes' : 'No'}
                  </label>
                ))}
              </div>
              <div>
                <p className="mb-2 text-base font-medium text-gray-900">
                  {t('returns.uploadPhotos', 'Upload product photos')}{' '}
                  <span className="text-sm font-normal text-gray-500">
                    {t('returns.optionalMaxPhotos', '(optional, up to 5)')}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {files.map(({ preview }, index) => (
                    <div
                      key={preview}
                      className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200"
                    >
                      <img
                        src={preview}
                        alt={`Return photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white hover:bg-black/80"
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {files.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-500 transition hover:border-[#1f7a3a] hover:text-[#1f7a3a]"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span className="mt-1 text-[10px]">{t('returns.addPhoto', 'Add photo')}</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
                {imageError && <p className="mt-2 text-xs text-red-600">{imageError}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Return Method & Pickup Address */}
        {step === 4 && (
          <div>
            <h2 id="return-request-title" className="mb-4 text-base font-bold text-gray-900">
              {t('returns.methodTitle', 'Return Method')}
            </h2>
            <p className="mb-4 pl-5 text-base font-medium text-gray-900">
              How would you like to return the product
            </p>
            <div className="mb-7 space-y-2 pl-5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <input
                  type="radio"
                  name="return-method"
                  value="pickup"
                  checked={returnMethod === 'pickup'}
                  onChange={() => setReturnMethod('pickup')}
                  className="h-4 w-4 accent-[#1f7a3a] text-[#1f7a3a] focus:ring-[#1f7a3a]"
                />
                Pickup from my address
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <input
                  type="radio"
                  name="return-method"
                  value="dropoff"
                  checked={returnMethod === 'dropoff'}
                  onChange={() => setReturnMethod('dropoff')}
                  className="h-4 w-4 accent-[#1f7a3a] text-[#1f7a3a] focus:ring-[#1f7a3a]"
                />
                Drop-off at nearest location
              </label>
            </div>

            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{t('returns.pickupAddress', 'Pick up Address')}</h3>
              {isChangingAddress && (
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingAddress(false);
                    setShowCustomAddressForm(false);
                  }}
                  className="text-sm font-semibold text-[#1f7a3a] hover:underline"
                >
                  {t('reviews.cancel', 'Cancel')}
                </button>
              )}
            </div>

            {!isChangingAddress ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-300 p-3.5">
                <div className="min-w-0 text-sm text-gray-900">
                  <p className="mb-1.5 text-xl font-bold">{pickupAddress?.name || t('orders.addressUnavailable', 'Address unavailable')}</p>
                  {pickupAddress?.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {pickupAddress?.phone && <p className="mt-2 text-base">{pickupAddress.phone}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingAddress(true);
                    setShowCustomAddressForm(false);
                  }}
                  className="shrink-0 rounded-md border border-[#3ca32a] bg-[#e9f7df] px-6 py-2 text-sm font-medium text-[#1f7a3a] transition hover:bg-[#daf0ca]"
                >
                  {t('returns.changeAddress', 'Change')}
                </button>
              </div>
            ) : (
              <div className="space-y-3 rounded border border-gray-300 p-3">
                {addresses.length > 0 && !showCustomAddressForm && (
                  <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                    {addresses.map((addr) => {
                      const isSelected =
                        selectedPickupAddress?.id
                          ? selectedPickupAddress.id === addr.id
                          : selectedPickupAddress?.address === addr.address &&
                            selectedPickupAddress?.pincode === addr.pincode;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedPickupAddress(addr);
                            setIsChangingAddress(false);
                          }}
                          className={`w-full rounded border p-2.5 text-left text-xs transition ${
                            isSelected
                              ? 'border-[#1f7a3a] bg-green-50/70'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{addr.fullName}</span>
                            {addr.addressType && (
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                                {addr.addressType}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-gray-700">
                            {addr.address}
                            {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          {addr.phoneNumber && <p className="mt-0.5 text-gray-600">{addr.phoneNumber}</p>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!showCustomAddressForm ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomAddressForm(true)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-[#1f7a3a] py-2 text-xs font-semibold text-[#1f7a3a] hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4" />
                    {t('returns.enterNewAddress', 'Enter another pickup address')}
                  </button>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                      <MapPin className="h-3.5 w-3.5 text-[#1f7a3a]" />
                      {t('returns.newPickupAddress', 'New Pickup Address')}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={customAddress.fullName}
                        onChange={(e) => setCustomAddress((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="rounded border border-gray-300 px-2.5 py-1.5 outline-none focus:border-[#1f7a3a]"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={customAddress.phoneNumber}
                        onChange={(e) => setCustomAddress((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        className="rounded border border-gray-300 px-2.5 py-1.5 outline-none focus:border-[#1f7a3a]"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Address (House No, Street, Area) *"
                      value={customAddress.address}
                      onChange={(e) => setCustomAddress((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full rounded border border-gray-300 px-2.5 py-1.5 outline-none focus:border-[#1f7a3a]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Landmark (Optional)"
                        value={customAddress.landmark}
                        onChange={(e) => setCustomAddress((prev) => ({ ...prev, landmark: e.target.value }))}
                        className="rounded border border-gray-300 px-2.5 py-1.5 outline-none focus:border-[#1f7a3a]"
                      />
                      <input
                        type="text"
                        placeholder="Pincode *"
                        value={customAddress.pincode}
                        onChange={(e) => setCustomAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                        className="rounded border border-gray-300 px-2.5 py-1.5 outline-none focus:border-[#1f7a3a]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City *"
                        value={customAddress.city}
                        onChange={(e) => setCustomAddress((prev) => ({ ...prev, city: e.target.value }))}
                        className="rounded border border-gray-300 px-2.5 py-1.5 outline-none focus:border-[#1f7a3a]"
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={customAddress.state}
                        onChange={(e) => setCustomAddress((prev) => ({ ...prev, state: e.target.value }))}
                        className="rounded border border-gray-300 px-2.5 py-1.5 outline-none focus:border-[#1f7a3a]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowCustomAddressForm(false)}
                        className="rounded border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={
                          !customAddress.fullName.trim() ||
                          !customAddress.phoneNumber.trim() ||
                          !customAddress.address.trim() ||
                          !customAddress.city.trim() ||
                          !customAddress.state.trim() ||
                          !customAddress.pincode.trim()
                        }
                        onClick={() => {
                          setSelectedPickupAddress({ ...customAddress });
                          setShowCustomAddressForm(false);
                          setIsChangingAddress(false);
                        }}
                        className="rounded bg-[#1f7a3a] px-3 py-1.5 font-semibold text-white hover:bg-[#176331] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Use This Address
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review Return */}
        {step === 5 && (
          <div>
            <h2 id="return-request-title" className="mb-3 text-base font-bold text-gray-900">
              {t('returns.reviewReturn', 'Review Return')}
            </h2>

            <div className="space-y-3 rounded-lg border border-gray-300 p-4 text-sm">
              <div className="grid grid-cols-[110px_1fr] items-start gap-2">
                <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                  <Hash className="h-4 w-4 text-gray-600" />
                  Order ID
                </span>
                <span className="font-semibold text-gray-900">#{displayOrderId}</span>
              </div>

              <div className="grid grid-cols-[110px_1fr] items-start gap-2">
                <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                  <Package className="h-4 w-4 text-gray-600" />
                  Product
                </span>
                <span className="font-medium text-[#1f7a3a]">{orderProductName}</span>
              </div>

              <div className="grid grid-cols-[110px_1fr] items-start gap-2">
                <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                  Reason
                </span>
                <span className="font-medium text-[#1f7a3a]">{selectedReasons.join(', ')}</span>
              </div>

              <div className="grid grid-cols-[110px_1fr] items-start gap-2">
                <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                  <CornerDownLeft className="h-4 w-4 text-gray-600" />
                  Return
                </span>
                <span className="font-medium text-[#1f7a3a]">
                  {returnMethod === 'pickup' ? 'Pickup from my address' : 'Drop-off at nearest location'}
                </span>
              </div>

              <div className="grid grid-cols-[110px_1fr] items-start gap-2">
                <span className="inline-flex items-center gap-2 font-medium text-gray-800">
                  <Receipt className="h-4 w-4 text-gray-600" />
                  Refund
                </span>
                <span className="font-semibold text-[#1f7a3a]">₹{orderRefundAmount}</span>
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-300 p-3.5 text-xs leading-relaxed text-gray-800">
              <input
                type="checkbox"
                checked={confirmPolicy}
                onChange={(event) => setConfirmPolicy(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-400 accent-[#1f7a3a] text-[#1f7a3a] focus:ring-[#1f7a3a]"
              />
              <span>
                {t(
                  'returns.confirmPolicy',
                  'I confirm that the information provided is accurate and the product meets the return policy conditions'
                )}
              </span>
            </label>
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || isSubmitting}
          className="mx-auto mt-8 flex w-full max-w-[250px] items-center justify-center rounded-md bg-[#1f7a3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#176331] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && isLastStep
            ? t('orders.returning', 'Submitting...')
            : isLastStep
            ? t('returns.submit', 'Submit Return Request')
            : t('returns.continue', 'Continue')}
        </button>
      </div>
    </div>
  );
}
