import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrders } from '../../services/orderStorage';
import { useTranslation } from 'react-i18next';
const statusStyles = {
    Placed: 'text-amber-700 bg-amber-50',
    'In Transit': 'text-blue-600 bg-blue-50',
    Delivered: 'text-green-600 bg-green-50',
    Cancelled: 'text-red-500 bg-red-50',
};
function formatOrderDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
export default function MyOrders() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
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
    return (<div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-5">
          <ShoppingBag className="w-5 h-5 text-[#2d6a2d]"/>
          <h3 className="text-base font-semibold text-gray-900">{t('orders.title')}</h3>
        </div>

        {orders.length === 0 ? (<div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-500 font-medium">{t('orders.empty')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('orders.emptyDesc')}</p>
          </div>) : (<div className="flex flex-col gap-3">
            {orders.map((order) => (<div key={order.id} role="button" tabIndex={0} onClick={() => navigate(`/profile/orders/${encodeURIComponent(order.id)}`)} onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(`/profile/orders/${encodeURIComponent(order.id)}`);
                    }
                }} className="flex items-center justify-between p-4 rounded-lg border border-gray-100
                           hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer focus:outline-none
                           focus:ring-2 focus:ring-[#2d6a2d]/20">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#f0f5ec] flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-[#2d6a2d]"/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{order.product}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.id} &nbsp;·&nbsp; {formatOrderDate(order.createdAt)} &nbsp;·&nbsp; {t('orders.itemCount', { count: order.itemCount })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">
                      &#8377;{order.total.toLocaleString('en-IN')}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[order.status]}`}>
                      {t(`orders.status.${order.status}`, order.status)}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400"/>
                </div>
              </div>))}
          </div>)}
      </div>
    </div>);
}
