import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useLoginPrompt } from './LoginPromptContext';
import * as cartApi from '../services/cartApi';
const CartContext = createContext(undefined);
const normalizeCartItem = (item) => {
    const id = item.id === undefined || item.id === null ? '' : String(item.id);
    const price = Number(item.price);
    const originalPrice = Number(item.originalPrice ?? item.original_price);
    const discountPriceValue = item.discountPrice ?? item.discount_price;
    const discountPrice = discountPriceValue === null || discountPriceValue === undefined
        ? NaN
        : Number(discountPriceValue);
    const quantity = Number(item.quantity ?? 1);
    if (!id)
        return null;
    if (!Number.isFinite(price) || price < 0)
        return null;
    if (!Number.isInteger(quantity) || quantity < 1)
        return null;
    return {
        id,
        slug: item.slug,
        name: item.name || 'Product',
        category: item.category,
        price,
        originalPrice: Number.isFinite(originalPrice) ? originalPrice : price,
        discountPrice: Number.isFinite(discountPrice) ? discountPrice : undefined,
        offer: item.offer,
        image: item.image || '',
        quantity,
        stock: item.stock === undefined ? undefined : Number(item.stock),
        rating: item.rating === undefined ? undefined : Number(item.rating),
    };
};
const normalizeCartItems = (cartItems) => {
    return cartItems
        .map(normalizeCartItem)
        .filter((item) => Boolean(item));
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
            originalPrice: Number.isFinite(Number(item.originalPrice)) && Number(item.originalPrice) > 0 ? item.originalPrice : fallback?.originalPrice,
            discountPrice: Number.isFinite(Number(item.discountPrice)) && Number(item.discountPrice) > 0 ? item.discountPrice : fallback?.discountPrice,
            offer: item.offer || fallback?.offer,
            image: item.image || fallback?.image,
        };
    }));
};
export function CartProvider({ children }) {
    const { user, accessToken, authReady, logout } = useAuth();
    const { showLoginPrompt } = useLoginPrompt();
    const userId = user?.id ?? null;
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [buyNowItem, setBuyNowItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const quantityTimers = useRef(new Map());
    const quantityVersions = useRef(new Map());
    useEffect(() => {
        let mounted = true;
        const loadCart = async () => {
            if (!authReady || !userId || !accessToken) {
                if (mounted) {
                    setItems([]);
                    setIsLoading(false);
                }
                return;
            }
            setIsLoading(true);
            try {
                const backendItems = await cartApi.getCartWithToken(accessToken);
                if (mounted) {
                    setItems(normalizeCartItems(backendItems));
                }
            }
            catch (error) {
                if (error.status === 401) {
                    if (mounted)
                        setItems([]);
                    await logout();
                    return;
                }
                console.warn('Failed to load cart from backend', error);
            }
            finally {
                if (mounted)
                    setIsLoading(false);
            }
        };
        void loadCart();
        return () => {
            mounted = false;
        };
    }, [accessToken, authReady, logout, userId]);
    useEffect(() => () => {
        quantityTimers.current.forEach((timer) => window.clearTimeout(timer));
        quantityTimers.current.clear();
    }, []);
    const addToCart = (newItem) => {
        if (!user || !accessToken) {
            showLoginPrompt('cart');
            return false;
        }
        const previousItems = items;
        setIsUpdating(true);
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
                setItems(previousItems);
                if (error.status === 401) {
                    await logout();
                    return;
                }
                console.warn('Failed to add cart item', error);
            }
            finally {
                setIsUpdating(false);
            }
        })();
        setIsOpen(true);
        return true;
    };
    const removeFromCart = (id) => {
        const previousItems = items;
        setItems((currentItems) => currentItems.filter((item) => item.id !== id));
        if (!user || !accessToken)
            return;
        setIsUpdating(true);
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
            finally {
                setIsUpdating(false);
            }
        })();
    };
    const updateQuantity = (id, quantity) => {
        if (quantity < 1)
            return;

        const cartItem = items.find((item) => item.id === id);
        const stock = Number(cartItem?.stock);
        if (Number.isFinite(stock) && quantity > stock)
            return;

        setItems((currentItems) => currentItems.map((item) => item.id === id ? { ...item, quantity } : item));
        if (!user || !accessToken)
            return;

        const version = (quantityVersions.current.get(id) || 0) + 1;
        quantityVersions.current.set(id, version);
        const pendingTimer = quantityTimers.current.get(id);
        if (pendingTimer)
            window.clearTimeout(pendingTimer);

        const timer = window.setTimeout(() => {
            quantityTimers.current.delete(id);
            setIsUpdating(true);

            void (async () => {
                try {
                    const updated = await cartApi.updateQuantity(id, quantity, accessToken);
                    if (quantityVersions.current.get(id) === version) {
                        setItems((currentItems) => mergeCartItems(updated, currentItems));
                    }
                }
                catch (error) {
                    if (error.status === 401) {
                        await logout();
                        return;
                    }

                    // Fetch the server value instead of overwriting newer local clicks.
                    if (quantityVersions.current.get(id) === version) {
                        try {
                            const updated = await cartApi.getCartWithToken(accessToken);
                            setItems(normalizeCartItems(updated));
                        }
                        catch (refreshError) {
                            console.warn('Failed to refresh cart after quantity update', refreshError);
                        }
                    }
                    console.warn('Failed to update cart item', error);
                }
                finally {
                    if (quantityVersions.current.get(id) === version)
                        setIsUpdating(false);
                }
            })();
        }, 200);

        quantityTimers.current.set(id, timer);
    };
    const toggleCart = (open) => {
        setIsOpen((prev) => (open !== undefined ? open : !prev));
    };
    const clearCart = () => {
        const previousItems = items;
        setItems([]);
        if (!user || !accessToken)
            return;
        setIsUpdating(true);
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
            finally {
                setIsUpdating(false);
            }
        })();
    };
    return (<CartContext.Provider value={{
            items,
            isOpen,
            buyNowItem,
            isLoading,
            isUpdating,
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
