export default function ReviewCard({ review }) {
    return (<div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col gap-3">
      {/* Reviewer Info */}
      <div className="flex items-center gap-3">
        <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover border border-gray-200"/>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">{review.author}</span>
          {review.isVerified && (<span className="text-[10px] text-gray-500">Verified buyer</span>)}
        </div>
      </div>

      {/* Review Content */}
      <p className="text-sm text-gray-700 leading-relaxed italic">
        "{review.content}"
      </p>
    </div>);
}
