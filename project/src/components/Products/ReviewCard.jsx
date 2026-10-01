import { Star } from 'lucide-react';

export default function ReviewCard({ review }) {
    const imageUrls = Array.isArray(review.image_urls) ? review.image_urls : [];
    return (<div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col gap-3">
      {/* Reviewer Info */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-green-100 bg-green-50 text-sm font-bold text-green-700" aria-hidden="true">V</div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">{review.reviewer_name || 'Verified customer'}</span>
          <span className="text-[10px] text-gray-500">Verified buyer</span>
        </div>
        <div className="ml-auto flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}
        </div>
      </div>

      {/* Review Content */}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 italic">&ldquo;{review.comment}&rdquo;</p>
      {imageUrls.length > 0 && (<div className="flex flex-wrap gap-2">
        {imageUrls.map((url, index) => <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Customer review photo ${index + 1}`} className="h-16 w-16 rounded-lg border border-gray-200 object-cover" /></a>)}
      </div>)}
    </div>);
}
