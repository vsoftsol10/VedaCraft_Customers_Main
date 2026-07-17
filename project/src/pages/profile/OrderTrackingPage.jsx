import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Home, MapPin, Package, ShoppingBag, Truck, XCircle, } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrderById, updateOrderStatus } from '../../services/orderStorage';
import { useTranslation } from 'react-i18next';
const trackingSteps = [
    { labelKey: 'orders.tracking.processing', icon: Check },
    { labelKey: 'orders.tracking.packed', icon: Package },
    { labelKey: 'orders.tracking.shipped', icon: Truck },
    { labelKey: 'orders.tracking.outForDelivery', icon: ShoppingBag },
    { labelKey: 'orders.tracking.delivered', icon: Home },
];
function formatDisplayDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}
function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate.toISOString();
}
function getActiveStep(status) {
    if (status === 'Delivered')
        return 4;
    if (status === 'In Transit')
        return 2;
    if (status === 'Cancelled')
        return 0;
    return 1;
}
export default function OrderTrackingPage() {
    const { t } = useTranslation();
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');
    useEffect(() => {
        let isActive = true;
        const loadOrder = async () => {
            if (!orderId) {
                setIsLoading(false);
                return;
            }
            const nextOrder = await getOrderById(orderId, user?.id);
            if (isActive) {
                setOrder(nextOrder);
                setIsLoading(false);
            }
        };
        void loadOrder();
        return () => {
            isActive = false;
        };
    }, [orderId, user?.id]);
    const activeStep = useMemo(() => (order ? getActiveStep(order.status) : 0), [order]);
    const expectedDate = order ? addDays(order.createdAt, order.status === 'In Transit' ? 2 : 3) : '';
    const totalQuantity = order?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
    const canCancel = order?.status !== 'Delivered' && order?.status !== 'Cancelled';
    const handleCancelOrder = async () => {
        if (!order || !canCancel)
            return;
        const shouldCancel = window.confirm(t('orders.cancelConfirm'));
        if (!shouldCancel)
            return;
        setIsCancelling(true);
        setCancelError('');
        const updatedOrder = await updateOrderStatus(order.id, 'Cancelled', user?.id);
        if (updatedOrder) {
            setOrder(updatedOrder);
        }
        else {
            setCancelError(t('orders.cancelError'));
        }
        setIsCancelling(false);
    };
    if (isLoading) {
        return (<div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
        {t('orders.loadingTracking')}
      </div>);
    }
    if (!order) {
        return (<div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3"/>
        <p className="text-base font-semibold text-gray-900">{t('orders.notFound')}</p>
        <Link to="/profile/orders" className="mt-3 inline-flex text-sm font-semibold text-[#2d6a2d]">
          {t('orders.backToOrders')}
        </Link>
      </div>);
    }
    return (<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <button type="button" onClick={() => navigate('/profile/orders')} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-[#2d6a2d] transition-colors">
            <ArrowLeft className="w-4 h-4"/>
            {t('orders.trackingTitle', { id: order.id })}
          </button>
          <p className="text-xs font-medium text-gray-500 mt-3">
            {t('orders.placedOn', { date: formatDisplayDate(order.createdAt) })}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${order.status === 'Cancelled'
            ? 'bg-red-50 text-red-600'
            : order.status === 'Delivered'
                ? 'bg-green-50 text-green-700'
                : 'bg-yellow-50 text-yellow-700'}`}>
            {t(`orders.status.${order.status}`, order.status)}
          </span>
          {canCancel && (<button type="button" onClick={handleCancelOrder} disabled={isCancelling} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
              <XCircle className="w-4 h-4"/>
              {isCancelling ? t('orders.cancelling') : t('orders.cancelOrder')}
            </button>)}
        </div>
      </div>

      {cancelError && (<div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {cancelError}
        </div>)}

      {order.status === 'Cancelled' ? (<div className="relative flex justify-between items-center mb-12 px-[10%]">
          <div className="absolute left-[15%] right-[15%] top-5 h-px bg-red-200"/>
          <div className="absolute left-[15%] right-[15%] top-5 h-px bg-red-500"/>
          
          <div className="relative flex flex-col items-center gap-2 text-center z-10 w-24">
            <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-white border-green-500 text-green-500">
              <Check className="w-4 h-4"/>
            </div>
            <div className="flex flex-col items-center mt-1">
              <span className="text-xs sm:text-sm font-semibold text-gray-900">{t('orders.ordered')}</span>
              <span className="text-[11px] text-gray-500 whitespace-nowrap mt-0.5">{formatDisplayDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="relative flex flex-col items-center gap-2 text-center z-10 w-24">
            <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-white border-red-500 text-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]">
              <XCircle className="w-4 h-4"/>
            </div>
            <div className="flex flex-col items-center mt-1">
              <span className="text-xs sm:text-sm font-semibold text-red-600">{t('orders.status.Cancelled')}</span>
              {order.updatedAt && (<span className="text-[11px] text-gray-500 whitespace-nowrap mt-0.5">{formatDisplayDate(order.updatedAt)}</span>)}
            </div>
          </div>
        </div>) : (<div className="relative grid grid-cols-5 gap-2 mb-8 mt-4">
          <div className="absolute left-[10%] right-[10%] top-5 h-px bg-gray-200"/>
          <div className="absolute left-[10%] top-5 h-px bg-[#2d8f3a] transition-all" style={{ width: `${Math.min(activeStep / (trackingSteps.length - 1), 1) * 80}%` }}/>
          {trackingSteps.map((step, index) => {
                const isCompleted = index < activeStep || (index === activeStep && order.status === 'Delivered');
                const isCurrent = index === activeStep && order.status !== 'Delivered';
                const isActive = index <= activeStep;
                const Icon = isCompleted ? Check : step.icon;
                // Calculate estimated date for this step
                const stepDate = new Date(order.createdAt);
                if (index === 4 && order.status === 'Delivered' && order.updatedAt) {
                    // Use actual updated date if delivered
                    stepDate.setTime(new Date(order.updatedAt).getTime());
                }
                else {
                    stepDate.setDate(stepDate.getDate() + index);
                }
                return (<div key={step.labelKey} className="relative flex flex-col items-center gap-2 text-center">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors z-10 ${isCompleted
                        ? 'bg-[#2d8f3a] border-[#2d8f3a] text-white shadow-sm'
                        : isCurrent
                            ? 'bg-white border-[#2d8f3a] text-[#2d8f3a]'
                            : 'bg-white border-gray-200 text-gray-300'}`}>
                  <Icon className="w-4 h-4"/>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {t(step.labelKey)}
                  </span>
                  <span className={`text-[10px] whitespace-nowrap mt-0.5 ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                    {formatDisplayDate(stepDate.toISOString())}
                  </span>
                </div>
              </div>);
            })}
        </div>)}

      <style>{`
        @keyframes truckDrive {
          0%   { transform: translateX(-10%); }
          80%  { transform: translateX(72%); }
          85%  { transform: translateX(68%); }
          90%  { transform: translateX(72%); }
          100% { transform: translateX(72%); }
        }
        @keyframes housePop {
          0%, 75% { transform: scale(0.8); opacity: 0.3; }
          85%      { transform: scale(1.2); opacity: 1; }
          100%     { transform: scale(1.0); opacity: 1; }
        }
        @keyframes roadPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
        .truck-animate { animation: truckDrive 3s ease-in-out infinite; }
        .house-animate { animation: housePop 3s ease-in-out infinite; }
        .road-pulse    { animation: roadPulse 1.5s ease-in-out infinite; }
      `}</style>

      <div className={`rounded-lg p-4 mb-5 ${order.status === 'Cancelled'
            ? 'border border-red-100 bg-red-50'
            : 'border border-yellow-200 bg-yellow-50/30'}`}>
        {order.status === 'Cancelled' ? (<div className="flex items-start gap-3">
            <XCircle className="w-7 h-7 text-red-500 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-bold text-red-600">{t('orders.cancelledMessage')}</p>
              <p className="text-xs text-gray-600 mt-1">{t('orders.cancelledDesc')}</p>
            </div>
          </div>) : order.status === 'Delivered' ? (<div className="flex items-start gap-3">
            <Home className="w-7 h-7 text-green-500 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-bold text-[#2d8f3a]">{t('orders.deliveredOn', { date: formatDisplayDate(order.createdAt) })}</p>
              <p className="text-xs text-gray-600 mt-1">{t('orders.deliveredDesc')}</p>
            </div>
          </div>) : (<div>
            <p className="text-sm font-bold text-[#2d8f3a] mb-3">
              {t('orders.arrivingBy', { date: formatDisplayDate(expectedDate) })}
            </p>
            {/* Animated truck delivery */}
            <div className="relative h-10 flex items-end overflow-hidden">
              {/* Road */}
              <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-yellow-300 road-pulse rounded-full"/>
              {/* Dashed road markers */}
              <div className="absolute bottom-1.5 left-[10%] right-[20%] flex gap-3">
                {[...Array(8)].map((_, i) => (<div key={i} className="h-px w-4 bg-yellow-200 road-pulse rounded"/>))}
              </div>
              {/* Truck */}
              <div className="absolute bottom-2 truck-animate">
                <Truck className="w-8 h-8 text-yellow-500"/>
              </div>
              {/* House destination */}
              <div className="absolute bottom-2 right-4 house-animate">
                <Home className="w-6 h-6 text-[#2d8f3a]"/>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{t('orders.onTheWay')}</p>
          </div>)}
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-7">
        <section className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-[#2d8f3a] mb-3">
            <MapPin className="w-4 h-4"/>
            <h3 className="text-sm font-bold text-gray-900">{t('orders.deliveryAddress')}</h3>
          </div>
          {order.address ? (<div className="text-sm text-gray-700 leading-6">
              <p className="font-semibold text-gray-900">{order.address.fullName}</p>
              <p>
                {order.address.address}
                {order.address.landmark ? `, ${order.address.landmark}` : ''}
              </p>
              <p>
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p>{order.address.phoneNumber}</p>
            </div>) : (<p className="text-sm text-gray-500">{t('orders.addressUnavailable')}</p>)}
        </section>

        <section className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-[#2d8f3a] mb-3">
            <CreditCard className="w-4 h-4"/>
            <h3 className="text-sm font-bold text-gray-900">{t('orders.orderDetails')}</h3>
          </div>
          <dl className="grid grid-cols-[90px_1fr] gap-y-2 text-sm">
            <dt className="text-gray-500">{t('orders.itemsLabel')}:</dt>
            <dd className="font-semibold text-gray-900">{totalQuantity || order.itemCount}</dd>
            <dt className="text-gray-500">{t('orders.payment')}:</dt>
            <dd className="font-semibold text-gray-900">{order.paymentMethod}</dd>
            <dt className="text-gray-500">{t('orders.total')}:</dt>
            <dd className="font-semibold text-gray-900">&#8377;{order.total.toLocaleString('en-IN')}</dd>
          </dl>
        </section>
      </div>

      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-3">{t('orders.orderItems')}</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {order.items.length === 0 ? (<p className="p-4 text-sm text-gray-500">{t('orders.itemDetailsUnavailable')}</p>) : (order.items.map((item) => (<div key={item.id} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover border border-gray-100"/>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    &#8377;{item.price.toLocaleString('en-IN')} &nbsp; {t('orders.quantity')}: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  &#8377;{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>)))}
          <div className="flex justify-between px-4 py-3 bg-gray-50 text-sm font-bold text-gray-900">
            <span>{t('orders.totalAmount')}:</span>
            <span>&#8377;{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </section>
    </div>);
}
