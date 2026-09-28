import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ListFilter, MapPin, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../services/orderStorage';
import { getReviewedOrderIds } from '../../services/reviewService';
import ReviewModal from '../../components/Orders/ReviewModal';

const ORDER_STATUS_FILTERS = [
  { id: 'onTheWay', label: 'On the way', statuses: ['Placed', 'Paid', 'Shipped', 'In Transit', 'Out for Delivery'] },
  { id: 'delivered', label: 'Delivered', statuses: ['Delivered'] },
  { id: 'cancelled', label: 'Cancelled', statuses: ['Cancelled'] },
  { id: 'returned', label: 'Returned', statuses: ['Return Requested'] },
];

function formatOrderDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getOrderImage(order) {
  const item = Array.isArray(order.items) ? order.items[0] : null;
  return item?.image || item?.image_url || item?.imageUrl || '';
}

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewedOrderIds, setReviewedOrderIds] = useState(() => new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const filterRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([getOrders(user?.id), getReviewedOrderIds()]).then(([nextOrders, reviewedIds]) => {
      if (!active) return;
      setOrders(nextOrders);
      setReviewedOrderIds(new Set(reviewedIds));
    });
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!isFilterOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isFilterOpen]);

  const toggleFilter = (id) => setActiveFilters((current) =>
    current.includes(id) ? current.filter((filter) => filter !== id) : [...current, id]
  );

  const selectedStatuses = activeFilters.length
    ? new Set(ORDER_STATUS_FILTERS.filter((filter) => activeFilters.includes(filter.id)).flatMap((filter) => filter.statuses))
    : null;
  const visibleOrders = selectedStatuses ? orders.filter((order) => selectedStatuses.has(order.status)) : orders;

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-950">
          <ArrowLeft className="h-5 w-5" />
          <h1 className="text-xl font-semibold tracking-tight">My Order</h1>
        </div>

        <div className="relative" ref={filterRef}>
          <button type="button" onClick={() => setIsFilterOpen((open) => !open)} className="flex h-10 items-center gap-1.5 border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50">
            <ListFilter className="h-4 w-4" /> Filter
            {activeFilters.length > 0 && <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2d6a2d] text-[10px] font-semibold text-white">{activeFilters.length}</span>}
          </button>
          {isFilterOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-52 border border-gray-200 bg-white p-3 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Filter</span>
                <button type="button" onClick={() => setActiveFilters([])} className="text-xs font-medium text-[#2d6a2d] hover:underline">Clear all</button>
              </div>
              <p className="mb-2 text-xs font-semibold text-gray-400">ORDER STATUS</p>
              <div className="space-y-2">
                {ORDER_STATUS_FILTERS.map((filter) => (
                  <label key={filter.id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={activeFilters.includes(filter.id)} onChange={() => toggleFilter(filter.id)} className="h-3.5 w-3.5 rounded border-gray-300 text-[#2d6a2d] focus:ring-[#2d6a2d]" />
                    {filter.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="border border-gray-300 bg-white py-14 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No orders yet</p>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="border border-gray-300 bg-white py-14 text-center">
          <ListFilter className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No orders match this filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const isDelivered = order.status === 'Delivered';
            const image = getOrderImage(order);
            const deliveryDate = formatOrderDate(order.deliveredAt || order.updatedAt || order.createdAt);
            const isReviewed = reviewedOrderIds.has(order.id);

            return (
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/profile/orders/${encodeURIComponent(order.id)}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/profile/orders/${encodeURIComponent(order.id)}`);
                  }
                }}
                className="flex min-h-[112px] cursor-pointer flex-col justify-between gap-4 border border-gray-300 bg-white p-3 transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d6a2d]/20 sm:flex-row sm:items-center sm:p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden bg-[#f7f7f3] sm:h-24 sm:w-24">
                    {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Package className="h-6 w-6 text-[#2d6a2d]" /></div>}
                  </div>
                  <p className="max-w-xl text-sm font-semibold leading-5 text-gray-950 sm:text-base">{order.product}</p>
                </div>

                <div className="flex min-w-[175px] items-center justify-end self-end sm:self-auto">
                  {isDelivered ? (
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-sm font-medium text-gray-900"><span className="h-2 w-2 rounded-full bg-green-600" />Delivery on {deliveryDate}</p>
                      <button type="button" disabled={isReviewed} onClick={(event) => { event.stopPropagation(); setReviewOrder(order); }} className="mt-2 text-sm font-medium text-gray-950 hover:text-[#2d6a2d] disabled:text-gray-400">{isReviewed ? 'Reviewed' : 'Rate & Review'}</button>
                    </div>
                  ) : (
                    <button type="button" onClick={(event) => { event.stopPropagation(); navigate(`/profile/orders/${encodeURIComponent(order.id)}`); }} className="inline-flex items-center gap-2 border border-[#58c52a] px-4 py-2 text-sm font-medium text-[#35a51b] hover:bg-green-50"><MapPin className="h-4 w-4" />Track Order</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewOrder && <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSubmitted={(orderId) => { setReviewedOrderIds((current) => new Set([...current, orderId])); setReviewOrder(null); }} />}
    </div>
  );
}
