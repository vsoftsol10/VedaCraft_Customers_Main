import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as cartApi from '../services/cartApi';
const CartContext = createContext(undefined);
const GUEST_CART_KEY = 'cart_guest';
const getCartStorageKey = (user) => user?.id ? `cart_${user.id}` : GUEST_CART_KEY;
const normalizeCartItem = (item) => {
    const id = Number(item.id);
    const price = Number(item.price);
    const quantity = Number(item.quantity ?? 1);
    if (!Number.isFinite(id) || id <= 0)
        return null;
    if (!Number.isFinite(price) || price < 0)
        return null;
    if (!Number.isInteger(quantity) || quantity < 1)
        return null;
    return {
        id,
        name: item.name || 'Product',
        price,
        image: item.image || '',
        quantity,
        rating: item.rating === undefined ? undefined : Number(item.rating),
    };
};
const normalizeCartItems = (cartItems) => {
    return cartItems
        .map(normalizeCartItem)
        .filter((item) => Boolean(item));
};
const parseStoredCart = (storageKey) => {
    try {
        const savedCart = localStorage.getItem(storageKey);
        const parsed = savedCart ? JSON.parse(savedCart) : [];
        return Array.isArray(parsed) ? normalizeCartItems(parsed) : [];
    }
    catch {
        return [];
    }
};
const mergeCartItems = (backendItems, fallbackItems) => {
    const fallbackMap = new Map(fallbackItems.map((item) => [item.id, item]));
    return normalizeCartItems(backendItems.map((item) => {
        const fallback = fallbackMap.get(item.id);
        return {
            ...fallback,
            ...item,
            name: item.name || fallback?.name,
            price: Number.isFinite(Number(item.price)) && Number(item.price) > 0 ? item.price : fallback?.price,
            image: item.image || fallback?.image,
        };
    }));
};
export function CartProvider({ children }) {
    const { user, accessToken, authReady, logout } = useAuth();
    const [cartStorageKey, setCartStorageKey] = useState(() => getCartStorageKey(user));
    const [items, setItems] = useState(() => parseStoredCart(getCartStorageKey(user)));
    const [isOpen, setIsOpen] = useState(false);
    const [buyNowItem, setBuyNowItem] = useState(null);
    useEffect(() => {
        let mounted = true;
        const loadCart = async () => {
            const nextStorageKey = getCartStorageKey(user);
            const storedItems = parseStoredCart(nextStorageKey);
            if (mounted) {
                setCartStorageKey(nextStorageKey);
                setItems(storedItems);
            }
            if (!authReady || !user || !accessToken) {
                return;
            }
            try {
                const backendItems = await cartApi.getCartWithToken(accessToken);
                if (mounted) {
                    setItems(normalizeCartItems(backendItems));
                }
            }
            catch (error) {
                if (error.status === 401) {
                    if (mounted)
                        setItems(storedItems);
                    await logout();
                    return;
                }
                console.warn('Failed to load cart from backend', error);
            }
        };
        void loadCart();
        return () => {
            mounted = false;
        };
    }, [accessToken, authReady, logout, user]);
    useEffect(() => {
        localStorage.setItem(cartStorageKey, JSON.stringify(items));
    }, [items, cartStorageKey]);
    const addToCart = (newItem) => {
        if (!user || !accessToken) {
            setItems((currentItems) => {
                const existingItem = currentItems.find((item) => item.id === newItem.id);
                return existingItem
                    ? currentItems.map((item) => item.id === newItem.id
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item)
                    : [...currentItems, newItem];
            });
            setIsOpen(true);
            return;
        }
        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.id === newItem.id);
            return existingItem
                ? currentItems.map((item) => item.id === newItem.id
                    ? { ...item, quantity: item.quantity + newItem.quantity }
                    : item)
                : [...currentItems, newItem];
        });
        void (async () => {
            try {
                const updated = await cartApi.addToCart(newItem, accessToken);
                setItems((currentItems) => mergeCartItems(updated, [...currentItems, newItem]));
            }
            catch (error) {
                if (error.status === 401) {
                    await logout();
                    return;
                }
                console.warn('Failed to add cart item', error);
            }
        })();
        setIsOpen(true);
    };
    const removeFromCart = (id) => {
        const previousItems = items;
        setItems((currentItems) => currentItems.filter((item) => item.id !== id));
        if (!user || !accessToken)
            return;
        void (async () => {
            try {
                const updated = await cartApi.removeFromCart(id, accessToken);
                setItems((currentItems) => mergeCartItems(updated, currentItems));
            }
            catch (error) {
                setItems(previousItems);
                if (error.status === 401) {
                    await logout();
                    return;
                }
                console.warn('Failed to remove cart item', error);
            }
        })();
    };
    const updateQuantity = (id, quantity) => {
        if (quantity < 1)
            return;
        const previousItems = items;
        setItems((currentItems) => currentItems.map((item) => item.id === id ? { ...item, quantity } : item));
        if (!user || !accessToken)
            return;
        void (async () => {
            try {
                const updated = await cartApi.updateQuantity(id, quantity, accessToken);
                setItems((currentItems) => mergeCartItems(updated, currentItems));
            }
            catch (error) {
                setItems(previousItems);
                if (error.status === 401) {
                    await logout();
                    return;
                }
                console.warn('Failed to update cart item', error);
            }
        })();
    };
    const toggleCart = (open) => {
        setIsOpen((prev) => (open !== undefined ? open : !prev));
    };
    const clearCart = () => {
        const previousItems = items;
        setItems([]);
        if (!user || !accessToken)
            return;
        void (async () => {
            try {
                const updated = await cartApi.clearCart(accessToken);
                setItems(normalizeCartItems(updated));
            }
            catch (error) {
                setItems(previousItems);
                if (error.status === 401) {
                    await logout();
                    return;
                }
                console.warn('Failed to clear cart', error);
            }
        })();
    };
    return (<CartContext.Provider value={{
            items,
            isOpen,
            buyNowItem,
            addToCart,
            removeFromCart,
            updateQuantity,
            toggleCart,
            clearCart,
            setBuyNowItem,
        }}>
      {children}
    </CartContext.Provider>);
}
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
