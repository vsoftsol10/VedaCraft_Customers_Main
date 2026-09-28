import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Star, X } from 'lucide-react';
import { submitReview } from '../../services/reviewService';

const MAX_IMAGES = 5;

export default function ReviewModal({ order, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const selectedFilesRef = useRef([]);

  useEffect(() => {
    selectedFilesRef.current = files;
  }, [files]);

  useEffect(() => () => {
    selectedFilesRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview));
  }, []);

  const addFiles = (selectedFiles) => {
    setError('');
    const available = MAX_IMAGES - files.length;
    const next = Array.from(selectedFiles).slice(0, available).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    if (selectedFiles.length > available) setError('You can add up to 5 photos.');
    setFiles((current) => [...current, ...next]);
  };

  const removeFile = (index) => {
    setFiles((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) return setError('Please choose a rating.');
    if (!comment.trim()) return setError('Please share your experience.');

    setIsSubmitting(true);
    setError('');
    try {
      await submitReview(order, { rating, comment: comment.trim(), files: files.map(({ file }) => file) });
      onSubmitted(order.id);
    } catch (submitError) {
      setError(submitError.message || 'Could not submit your review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">Rate &amp; Review</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close review form"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5 p-5">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-900">{order.product}</p>
            <p className="mt-1 text-xs text-gray-500">Order #{order.orderNumber || order.order_number || order.id}</p>
          </div>
          <fieldset>
            <legend className="text-sm font-semibold text-gray-900">How would you rate this product?</legend>
            <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Product rating">
              {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className="rounded p-1" aria-label={`${value} star${value === 1 ? '' : 's'}`}><Star className={`h-7 w-7 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} /></button>)}
            </div>
          </fieldset>
          <label className="block text-sm font-semibold text-gray-900">Share your experience
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={4} placeholder="Write your review here..." className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]/15" />
            <span className="mt-1 block text-right text-xs font-normal text-gray-400">{comment.length}/1000</span>
          </label>
          <div><p className="text-sm font-semibold text-gray-900">Add photos <span className="font-normal text-gray-400">(optional, up to 5)</span></p>
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map(({ preview }, index) => <div key={preview} className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200"><img src={preview} alt={`Selected review photo ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => removeFile(index)} className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white" aria-label="Remove photo"><X className="h-3 w-3" /></button></div>)}
              {files.length < MAX_IMAGES && <button type="button" onClick={() => inputRef.current?.click()} className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-[#2d6a2d] hover:text-[#2d6a2d]"><ImagePlus className="h-5 w-5" /><span className="mt-1 text-[10px]">Add photo</span></button>}
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4"><button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button><button disabled={isSubmitting} className="rounded-lg bg-[#2d6a2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#235623] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Submitting...' : 'Submit review'}</button></div>
      </form>
    </div>
  );
}
