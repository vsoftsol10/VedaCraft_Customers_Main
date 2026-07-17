import { supabase } from '../lib/supabase';
const ORDER_STORAGE_KEY = 'vc_orders';
function readAllOrders() {
    try {
        const saved = localStorage.getItem(ORDER_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    }
    catch (error) {
        console.error('Failed to read orders', error);
        return [];
    }
}
function writeAllOrders(orders) {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}
function sortOrders(orders) {
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function getStoredUserId() {
    try {
        const saved = localStorage.getItem('vc_user');
        if (!saved)
            return null;
        const parsed = JSON.parse(saved);
        return parsed?.id ?? null;
    }
    catch {
        return null;
    }
}
async function resolveUserId() {
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    if (sessionUser?.id) {
        return sessionUser.id;
    }
    return getStoredUserId() || 'guest';
}
function normalizeOrder(row, fallbackUserId) {
    const addressValue = row.address;
    return {
        id: row.id,
        createdAt: row.created_at || row.createdAt || new Date().toISOString(),
        status: row.status || 'Placed',
        paymentMethod: row.payment_method || row.paymentMethod || 'Cash on Delivery',
        total: Number(row.total ?? 0),
        itemCount: Number(row.item_count ?? row.itemCount ?? 0),
        product: row.product || 'Vedha Craft Order',
        items: Array.isArray(row.items) ? row.items : [],
        address: addressValue && typeof addressValue === 'object'
            ? addressValue
            : addressValue && typeof addressValue === 'string'
                ? JSON.parse(addressValue)
                : undefined,
        userId: row.user_id || row.userId || fallbackUserId,
        updatedAt: row.updated_at || row.updatedAt,
    };
}
export async function getOrders(userId) {
    const localOrders = readAllOrders();
    const visibleLocalOrders = userId
        ? localOrders.filter((order) => !order.userId || order.userId === userId)
        : localOrders;
    const resolvedUserId = await resolveUserId();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', resolvedUserId)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Failed to fetch orders:', error.message);
        return sortOrders(visibleLocalOrders);
    }
    const remoteOrders = (data || []).map((row) => normalizeOrder(row, resolvedUserId));
    if (remoteOrders.length > 0) {
        return sortOrders(remoteOrders);
    }
    return sortOrders(visibleLocalOrders);
}
export async function getOrderById(orderId, userId) {
    const orders = await getOrders(userId);
    return orders.find((order) => order.id === orderId) ?? null;
}
export async function updateOrderStatus(orderId, status, userId) {
    const localOrders = readAllOrders();
    const localOrder = localOrders.find((order) => order.id === orderId);
    const updatedLocalOrder = localOrder ? { ...localOrder, status, updatedAt: new Date().toISOString() } : null;
    if (updatedLocalOrder) {
        writeAllOrders(localOrders.map((order) => (order.id === orderId ? updatedLocalOrder : order)));
    }
    const resolvedUserId = await resolveUserId();
    const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('user_id', resolvedUserId)
        .select()
        .single();
    if (error) {
        console.error('Failed to update order status:', error.message);
        return updatedLocalOrder ?? getOrderById(orderId, userId);
    }
    const savedOrder = normalizeOrder(data, resolvedUserId);
    writeAllOrders([
        savedOrder,
        ...localOrders.filter((existing) => existing.id !== orderId),
    ]);
    return savedOrder;
}
export async function saveOrder(order) {
    const localOrders = readAllOrders();
    const nextOrder = {
        ...order,
        id: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'Placed',
    };
    writeAllOrders([nextOrder, ...localOrders]);
    const resolvedUserId = await resolveUserId();
    const { data, error } = await supabase
        .from('orders')
        .insert([
        {
            user_id: resolvedUserId,
            status: nextOrder.status,
            payment_method: nextOrder.paymentMethod,
            total: nextOrder.total,
            item_count: nextOrder.itemCount,
            product: nextOrder.product,
            items: nextOrder.items,
            address: nextOrder.address ?? null,
        },
    ])
        .select()
        .single();
    if (error) {
        console.error('Failed to save order:', error.message);
        return nextOrder;
    }
    const savedOrder = normalizeOrder(data, resolvedUserId);
    writeAllOrders([savedOrder, ...localOrders.filter((existing) => existing.id !== nextOrder.id)]);
    return savedOrder;
}
