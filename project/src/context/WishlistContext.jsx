import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as wishlistApi from '../services/wishlistApi';
const WishlistContext = createContext(undefined);
export function WishlistProvider({ children }) {
    const { user, accessToken, authReady, logout } = useAuth();
    const [items, setItems] = useState([]);
    // Load wishlist from backend when user logs in or on app init
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!authReady)
                return;
            if (!user || !accessToken) {
                if (mounted)
                    setItems([]);
                return;
            }
            try {
                const backendItems = await wishlistApi.getWishlist(accessToken);
                if (mounted) {
                    // dedupe by id
                    const map = new Map();
                    backendItems.forEach((p) => map.set(p.id, p));
                    setItems(Array.from(map.values()));
                }
            }
            catch (err) {
                if (err.status === 401) {
                    if (mounted)
                        setItems([]);
                    await logout();
                    return;
                }
                console.warn('Failed to load wishlist', err);
            }
        };
        void load();
        return () => {
            mounted = false;
        };
    }, [accessToken, authReady, logout, user]);
    const addToWishlist = (product) => {
        if (!user || !accessToken) {
            alert('Please log in to add items to your wishlist');
            return;
        }
        // optimistic add
        setItems((currentItems) => {
            if (currentItems.some((i) => i.id === product.id))
                return currentItems;
            return [...currentItems, product];
        });
        void (async () => {
            try {
                const updated = await wishlistApi.addToWishlist(product, accessToken);
                // update to authoritative backend response (dedupe)
                const map = new Map();
                updated.forEach((p) => map.set(p.id, p));
                setItems(Array.from(map.values()));
            }
            catch (err) {
                // rollback optimistic add
                setItems((currentItems) => currentItems.filter((i) => i.id !== product.id));
                if (err.status === 401) {
                    await logout();
                    return;
                }
                console.warn('Failed to add wishlist item', err);
            }
        })();
    };
    const removeFromWishlist = (productId) => {
        if (!user || !accessToken) {
            alert('Please log in to manage your wishlist');
            return;
        }
        // optimistic remove
        const prev = items;
        setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
        void (async () => {
            try {
                const updated = await wishlistApi.removeFromWishlist(productId, accessToken);
                const map = new Map();
                updated.forEach((p) => map.set(p.id, p));
                setItems(Array.from(map.values()));
            }
            catch (err) {
                // rollback
                setItems(prev);
                if (err.status === 401) {
                    await logout();
                    return;
                }
                console.warn('Failed to remove wishlist item', err);
            }
        })();
    };
    const isInWishlist = (productId) => {
        return items.some((item) => item.id === productId);
    };
    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        }
        else {
            addToWishlist(product);
        }
    };
    return (<WishlistContext.Provider value={{
            items,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist,
        }}>
      {children}
    </WishlistContext.Provider>);
}
export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
