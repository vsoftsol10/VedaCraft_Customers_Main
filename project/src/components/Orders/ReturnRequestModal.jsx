import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export default function ReturnRequestModal({ order, isSubmitting = false, onClose, onSubmit }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [returnMethod, setReturnMethod] = useState('pickup');
  const [isOriginalCondition, setIsOriginalCondition] = useState('yes');
  const [hasOriginalPackaging, setHasOriginalPackaging] = useState('yes');
  const [issueDescription, setIssueDescription] = useState('');

  const pickupAddress = useMemo(() => formatAddress(order?.address), [order?.address]);
  const canContinue =
    (step === 1 && selectedReasons.length > 0) ||
    step === 2 ||
    step === 3 ||
    (step === 4 && issueDescription.trim().length > 0);

  const toggleReason = (reasonId) => {
    setSelectedReasons((current) =>
      current.includes(reasonId) ? current.filter((item) => item !== reasonId) : [...current, reasonId]
    );
  };

  const handleBack = () => {
    if (step === 1) {
      onClose();
      return;
    }
    setStep((current) => current - 1);
  };

  const handleContinue = () => {
    if (!canContinue || isSubmitting) return;

    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    onSubmit({
      reasons: selectedReasons,
      reason: selectedReasons.join(', '),
      returnMethod,
      pickupAddress: order?.address || null,
      isOriginalCondition: isOriginalCondition === 'yes',
      hasOriginalPackaging: hasOriginalPackaging === 'yes',
      issueDescription: issueDescription.trim(),
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
          {t('profile.cancel', 'Back')}
        </button>

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

        {step === 2 && (
          <div>
            <h2 id="return-request-title" className="mb-4 text-base font-bold text-gray-900">
              {t('returns.title', 'Return Method')}
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
                  className="h-4 w-4 text-[#1f7a3a] focus:ring-[#1f7a3a]"
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
                  className="h-4 w-4 text-[#1f7a3a] focus:ring-[#1f7a3a]"
                />
                Drop-off at nearest location
              </label>
            </div>

            <h3 className="mb-2 text-2xl font-bold text-gray-900">{t('returns.pickupAddress', 'Pickup Address')}</h3>
            <div className="flex items-center justify-between gap-3 rounded border border-gray-300 p-3">
              <div className="min-w-0 text-sm text-gray-900">
                <p className="mb-2 text-xl font-bold">{pickupAddress?.name || t('orders.addressUnavailable', 'Address unavailable')}</p>
                {pickupAddress?.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {pickupAddress?.phone && <p className="mt-2 text-base">{pickupAddress.phone}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 id="return-request-title" className="mb-4 text-base font-bold text-gray-900">
              Describe the Issue
            </h2>
            <div className="space-y-7 pl-5">
              <div>
                <p className="mb-4 text-base font-medium text-gray-900">
                  Is the product used and in its original condition
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
                  Does the product have its original packaging
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
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 id="return-request-title" className="mb-4 text-base font-bold text-gray-900">
              Describe the Issue
            </h2>
            <label className="mb-5 block text-base font-bold text-gray-900" htmlFor="return-issue">
              what is the issue
            </label>
            <textarea
              id="return-issue"
              value={issueDescription}
              onChange={(event) => setIssueDescription(event.target.value)}
              className="h-28 w-full resize-none rounded border border-gray-300 p-3 text-base text-gray-900 outline-none focus:border-[#1f7a3a] focus:ring-1 focus:ring-[#1f7a3a]"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || isSubmitting}
          className="mx-auto mt-8 flex w-full max-w-[250px] items-center justify-center rounded-md bg-[#1f7a3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#176331] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && step === 4
            ? t('orders.returning', 'Submitting...')
            : step === 4
            ? t('returns.submit', 'Submit Return Request')
            : t('returns.continue', 'Continue')}
        </button>
      </div>
    </div>
  );
}
