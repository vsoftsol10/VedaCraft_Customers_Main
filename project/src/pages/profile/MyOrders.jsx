// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ShoppingBag, ChevronRight, Package } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { getOrders } from '../../services/orderStorage';
// import { useTranslation } from 'react-i18next';
// const statusStyles = {
//     Placed: 'text-amber-700 bg-amber-50',
//     'In Transit': 'text-blue-600 bg-blue-50',
//     Delivered: 'text-green-600 bg-green-50',
//     Cancelled: 'text-red-500 bg-red-50',
// };
// function formatOrderDate(date) {
//     return new Date(date).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//     });
// }
// export default function MyOrders() {
//     const { t } = useTranslation();
//     const { user } = useAuth();
//     const navigate = useNavigate();
//     const [orders, setOrders] = useState([]);
//     useEffect(() => {
//         let isActive = true;
//         const loadOrders = async () => {
//             const nextOrders = await getOrders(user?.id);
//             if (isActive) {
//                 setOrders(nextOrders);
//             }
//         };
//         void loadOrders();
//         return () => {
//             isActive = false;
//         };
//     }, [user?.id]);
//     return (<div className="flex flex-col gap-4">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
//         <div className="flex items-center gap-2 mb-5">
//           <ShoppingBag className="w-5 h-5 text-[#2d6a2d]"/>
//           <h3 className="text-base font-semibold text-gray-900">{t('orders.title')}</h3>
//         </div>

//         {orders.length === 0 ? (<div className="text-center py-12">
//             <Package className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
//             <p className="text-gray-500 font-medium">{t('orders.empty')}</p>
//             <p className="text-gray-400 text-sm mt-1">{t('orders.emptyDesc')}</p>
//           </div>) : (<div className="flex flex-col gap-3">
//             {orders.map((order) => (<div key={order.id} role="button" tabIndex={0} onClick={() => navigate(`/profile/orders/${encodeURIComponent(order.id)}`)} onKeyDown={(event) => {
//                     if (event.key === 'Enter' || event.key === ' ') {
//                         event.preventDefault();
//                         navigate(`/profile/orders/${encodeURIComponent(order.id)}`);
//                     }
//                 }} className="flex items-center justify-between p-4 rounded-lg border border-gray-100
//                            hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer focus:outline-none
//                            focus:ring-2 focus:ring-[#2d6a2d]/20">
//                 <div className="flex items-center gap-4 min-w-0">
//                   <div className="w-10 h-10 rounded-lg bg-[#f0f5ec] flex items-center justify-center flex-shrink-0">
//                     <Package className="w-5 h-5 text-[#2d6a2d]"/>
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-sm font-semibold text-gray-900 truncate">{order.product}</p>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                       {order.id} &nbsp;·&nbsp; {formatOrderDate(order.createdAt)} &nbsp;·&nbsp; {t('orders.itemCount', { count: order.itemCount })}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <div className="text-right hidden sm:block">
//                     <p className="text-sm font-bold text-gray-900">
//                       &#8377;{order.total.toLocaleString('en-IN')}
//                     </p>
//                     <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[order.status]}`}>
//                       {t(`orders.status.${order.status}`, order.status)}
//                     </span>
//                   </div>
//                   <ChevronRight className="w-4 h-4 text-gray-400"/>
//                 </div>
//               </div>))}
//           </div>)}
//       </div>
//     </div>);
// }


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Package, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrders, submitReturnRequest, updateOrderStatus } from '../../services/orderStorage';
import { useTranslation } from 'react-i18next';
import ReturnRequestModal from '../../components/Orders/ReturnRequestModal';

const statusStyles = {
  Placed: 'text-amber-700 bg-amber-50',
  Paid: 'text-amber-700 bg-amber-50',
  Shipped: 'text-indigo-600 bg-indigo-50',
  'In Transit': 'text-blue-600 bg-blue-50',
  Delivered: 'text-green-600 bg-green-50',
  Cancelled: 'text-red-500 bg-red-50',
  'Return Requested': 'text-purple-600 bg-purple-50',
};

// Statuses past which an order can no longer be cancelled
const NON_CANCELLABLE_STATUSES = ['Shipped', 'In Transit', 'Delivered', 'Cancelled', 'Return Requested'];

const RETURN_WINDOW_DAYS = 3;

function formatOrderDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Days elapsed since delivery, used to gate the return window
function daysSinceDelivery(deliveredAt) {
  if (!deliveredAt) return Infinity;
  const deliveredDate = new Date(deliveredAt);
  const now = new Date();
  const diffMs = now - deliveredDate;
  return diffMs / (1000 * 60 * 60 * 24);
}

export default function MyOrders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [actioningOrderId, setActioningOrderId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [cancelOrder, setCancelOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);

  useEffect(() => {
    let isActive = true;
    const loadOrders = async () => {
      const nextOrders = await getOrders(user?.id);
      if (isActive) {
        setOrders(nextOrders);
      }
    };
    void loadOrders();
    return () => {
      isActive = false;
    };
  }, [user?.id]);

  const handleCancelOrder = async (event, order) => {
    event.stopPropagation();
    if (NON_CANCELLABLE_STATUSES.includes(order.status)) return;

    setCancelOrder(order);
  };

  const confirmCancelOrder = async () => {
    if (!cancelOrder) return;
    const order = cancelOrder;
    setCancelOrder(null);
    setActioningOrderId(order.id);
    setActionError('');
    const updatedOrder = await updateOrderStatus(order.id, 'Cancelled', user?.id);
    if (updatedOrder) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)));
    } else {
      setActionError(t('orders.cancelError', 'Could not cancel the order. Please try again.'));
    }
    setActioningOrderId(null);
  };

  const handleReturnOrder = async (event, order, withinReturnWindow) => {
    event.stopPropagation();
    if (!withinReturnWindow) return;

    setReturnOrder(order);
  };

  const confirmReturnOrder = async (returnRequest) => {
    if (!returnOrder) return;
    const order = returnOrder;
    setActioningOrderId(order.id);
    setActionError('');
    const result = await submitReturnRequest(order.id, returnRequest, user?.id);
    if (result?.order) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? result.order : o)));
      setReturnOrder(null);
    } else {
      setActionError(t('orders.returnError', 'Could not process the return. Please try again.'));
    }
    setActioningOrderId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-5">
          <ShoppingBag className="w-5 h-5 text-[#2d6a2d]" />
          <h3 className="text-base font-semibold text-gray-900">{t('orders.title')}</h3>
        </div>

        {actionError && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {actionError}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('orders.empty')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('orders.emptyDesc')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const isDelivered = order.status === 'Delivered';
              const isCancelDisabled = NON_CANCELLABLE_STATUSES.includes(order.status);
              const isBusy = actioningOrderId === order.id;

              // Return is only offered on delivered orders, within the return window
              const elapsedDays = daysSinceDelivery(order.deliveredAt || order.updatedAt || order.createdAt);
              const withinReturnWindow = isDelivered && elapsedDays <= RETURN_WINDOW_DAYS;
              const returnWindowExpired = isDelivered && elapsedDays > RETURN_WINDOW_DAYS;

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
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-gray-100
                           hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer focus:outline-none
                           focus:ring-2 focus:ring-[#2d6a2d]/20"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#f0f5ec] flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-[#2d6a2d]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{order.product}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.id} &nbsp;·&nbsp; {formatOrderDate(order.createdAt)} &nbsp;·&nbsp;{' '}
                        {t('orders.itemCount', { count: order.itemCount })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-14 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-gray-900">
                        &#8377;{order.total.toLocaleString('en-IN')}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[order.status]}`}
                      >
                        {t(`orders.status.${order.status}`, order.status)}
                      </span>
                    </div>

                    {isDelivered ? (
                      // Delivered orders show Return instead of Cancel, gated by the 3-day window
                      (withinReturnWindow || returnWindowExpired) && (
                        <button
                          type="button"
                          disabled={!withinReturnWindow || isBusy}
                          onClick={(event) => handleReturnOrder(event, order, withinReturnWindow)}
                          title={
                            !withinReturnWindow
                              ? t('orders.returnDisabledTooltip', 'Return window has expired')
                              : undefined
                          }
                          className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors flex-shrink-0 disabled:cursor-not-allowed
                            ${
                              withinReturnWindow
                                ? 'text-[#2d6a2d] border-[#2d6a2d]/30 bg-white hover:bg-[#f0f5ec] cursor-pointer disabled:opacity-60'
                                : 'text-gray-400 border-gray-200 bg-gray-50'
                            }`}
                        >
                          {isBusy ? t('orders.returning', 'Processing...') : t('orders.return', 'Return')}
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        disabled={isCancelDisabled || isBusy}
                        onClick={(event) => handleCancelOrder(event, order)}
                        title={
                          isCancelDisabled
                            ? t('orders.cancelDisabledTooltip', 'This order can no longer be cancelled')
                            : undefined
                        }
                        className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors flex-shrink-0 disabled:cursor-not-allowed
                          ${
                            isCancelDisabled
                              ? 'text-gray-400 border-gray-200 bg-gray-50'
                              : 'text-red-600 border-red-200 bg-white hover:bg-red-50 cursor-pointer disabled:opacity-60'
                          }`}
                      >
                        {isBusy ? t('orders.cancelling', 'Cancelling...') : t('orders.cancel', 'Cancel')}
                      </button>
                    )}

                    <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cancelOrder && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setCancelOrder(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-gray-100"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
          >
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <h2 id="cancel-order-title" className="text-center text-lg font-bold text-gray-900">
              {t('orders.cancelOrder', 'Cancel Order')}
            </h2>
            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              {t('orders.cancelConfirm', 'Are you sure you want to cancel this order?')}
            </p>
            <p className="mt-3 text-center text-xs font-medium text-gray-400">
              {cancelOrder.product}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCancelOrder(null)}
                className="rounded-md border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t('orders.keepOrder', 'Keep Order')}
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                className="rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                {t('orders.cancelOrder', 'Cancel Order')}
              </button>
            </div>
          </div>
        </div>
      )}

      {returnOrder && (
        <ReturnRequestModal
          order={returnOrder}
          isSubmitting={actioningOrderId === returnOrder.id}
          onClose={() => setReturnOrder(null)}
          onSubmit={confirmReturnOrder}
        />
      )}
    </div>
  );
}
