import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Package, Plus, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { submitReview } from '../../services/reviewService';

const MAX_IMAGES = 5;
const MAX_COMMENT_LENGTH = 900;

export default function ReviewModal({ order, onClose, onSubmitted }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const selectedFilesRef = useRef([]);

  const firstItem = Array.isArray(order?.items) ? order.items[0] : null;
  const productImage = firstItem?.image || firstItem?.image_url || firstItem?.imageUrl || order?.image || '';
  const productName = order?.product || firstItem?.name || firstItem?.title || 'Product';
  const productQty = firstItem?.quantity || firstItem?.qty || order?.quantity || 1;
  const productPrice = order?.total ?? order?.amount ?? firstItem?.price ?? '';

  useEffect(() => {
    selectedFilesRef.current = files;
  }, [files]);

  useEffect(() => () => {
    selectedFilesRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview));
  }, []);

  const addFiles = (selectedFiles) => {
    setError('');
    const incoming = Array.from(selectedFiles || []);
    if (!incoming.length) return;
    const available = MAX_IMAGES - files.length;
    const next = incoming.slice(0, available).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    if (incoming.length > available) setError(t('reviews.maxPhotosError', 'You can add up to 5 photos.'));
    setFiles((current) => [...current, ...next]);
  };

  const removeFile = (index) => {
    setFiles((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer?.files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) return setError(t('reviews.chooseRatingError', 'Please choose a rating.'));
    if (!comment.trim()) return setError(t('reviews.shareExperienceError', 'Please share your experience.'));

    setIsSubmitting(true);
    setError('');
    try {
      await submitReview(order, { rating, comment: comment.trim(), files: files.map(({ file }) => file) });
      onSubmitted(order.id);
    } catch (submitError) {
      setError(submitError.message || t('reviews.submitError', 'Could not submit your review.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholderSlotCount = Math.max(0, Math.min(3, MAX_IMAGES) - files.length);

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-black/45" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-[390px] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">{t('reviews.rateAndReview', 'Rate & Review')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close review form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-[#f7f7f3]">
              {productImage ? (
                <img src={productImage} alt={productName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-6 w-6 text-[#3ca32a]" />
                </div>
              )}
            </div>
            <div className="min-w-0 text-xs">
              <p className="truncate text-sm font-bold text-gray-900">{productName}</p>
              <p className="mt-1 font-medium text-gray-700">QTY : {productQty}</p>
              {productPrice !== '' && productPrice !== null && productPrice !== undefined && (
                <p className="mt-0.5 font-bold text-gray-900">₹{productPrice}</p>
              )}
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-bold text-gray-900">
              1. {t('reviews.ratingLabel', 'Rating')}
            </legend>
            <p className="mt-1 text-xs font-medium text-gray-700">
              {t('reviews.howToRate', 'How would you rate this product ?')}
            </p>
            <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="Product rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      value <= rating ? 'fill-[#3ca32a] text-[#3ca32a]' : 'text-amber-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <p className="text-sm font-bold text-gray-900">
              2. {t('reviews.reviewLabel', 'Review')}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-700">
              {t('reviews.shareExperience', 'Share your experience with this product.')}
            </p>
            <div className="relative mt-2">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={MAX_COMMENT_LENGTH}
                rows={4}
                placeholder={t('reviews.placeholder', 'Write your review here....')}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 pb-6 text-xs text-gray-900 outline-none focus:border-[#3ca32a] focus:ring-2 focus:ring-[#3ca32a]/15"
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-gray-400">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900">
              3. {t('reviews.addPhotosOptional', 'Add Photos (optional)')}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-700">
              {t('reviews.uploadUpto5', 'Upload upto 5 photos')}
            </p>

            <div
              role="button"
              tabIndex={0}
              onClick={() => files.length < MAX_IMAGES && inputRef.current?.click()}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && files.length < MAX_IMAGES) {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`mt-2.5 flex cursor-pointer flex-col items-center justify-center rounded-lg border px-4 py-4 text-center transition ${
                isDragging
                  ? 'border-[#3ca32a] bg-green-50/60'
                  : 'border-gray-300 bg-white hover:border-[#3ca32a]'
              }`}
            >
              <ImagePlus className="h-5 w-5 text-gray-400" />
              <span className="mt-1.5 text-[11px] font-medium text-gray-700">
                {t('reviews.clickOrDrag', 'Click to upload and drag photo')}
              </span>
              <span className="mt-0.5 text-[10px] text-gray-400">PNG, JPG - max 5MB</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2.5">
              {files.map(({ preview }, index) => (
                <div
                  key={preview}
                  className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-300"
                >
                  <img src={preview} alt={`Selected review photo ${index + 1}`} className="h-full w-full object-cover" />
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

              {Array.from({ length: placeholderSlotCount }).map((_, idx) => (
                <button
                  key={`slot-${idx}`}
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex h-14 w-14 items-center justify-center rounded-lg border border-gray-300 text-gray-400 transition hover:border-[#3ca32a] hover:text-[#3ca32a]"
                  aria-label={t('reviews.addPhoto', 'Add photo')}
                >
                  <Plus className="h-5 w-5" />
                </button>
              ))}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = '';
              }}
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md border border-gray-800 bg-white py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:opacity-60"
          >
            {t('reviews.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#3ca32a] py-2.5 text-sm font-semibold text-white transition hover:bg-[#318922] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t('reviews.submitting', 'Submitting...') : t('reviews.submitReview', 'Submit Review')}
          </button>
        </div>
      </form>
    </div>
  );
}
