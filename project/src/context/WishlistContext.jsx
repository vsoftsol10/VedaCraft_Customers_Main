import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLoginPrompt } from './LoginPromptContext';
import * as wishlistApi from '../services/wishlistApi';

const WishlistContext = createContext(undefined);

const dedupeProducts = (products) => {
  const map = new Map();

  (Array.isArray(products) ? products : []).forEach((product) => {
    if (product?.id !== undefined && product?.id !== null) {
      map.set(String(product.id), product);
    }
  });

  return Array.from(map.values());
};

export function WishlistProvider({ children }) {
  const { user, accessToken, authReady, logout } = useAuth();
  const { showLoginPrompt } = useLoginPrompt();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!authReady) return;

      if (!user || !accessToken) {
        if (mounted) setItems([]);
        return;
      }

      try {
        const backendItems = await wishlistApi.getWishlist(accessToken);
        if (mounted) setItems(dedupeProducts(backendItems));
      } catch (err) {
        if (err?.status === 401) {
          if (mounted) setItems([]);
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

  const addToWishlist = async (product) => {
    if (!user || !accessToken) {
      showLoginPrompt('wishlist');
      return false;
    }

    if (product?.id === undefined || product?.id === null) {
      console.warn('Invalid product passed to wishlist', product);
      return false;
    }

    const productId = String(product.id);
    const previousItems = items;

    if (previousItems.some((item) => String(item.id) === productId)) {
      return true;
    }

    setItems((current) => dedupeProducts([...current, product]));

    try {
      const updatedItems = await wishlistApi.addToWishlist(product, accessToken);
      setItems(dedupeProducts(updatedItems));
      return true;
    } catch (err) {
      setItems(previousItems);

      if (err?.status === 401) {
        await logout();
      } else {
        console.warn('Failed to add wishlist item', err);
        const message = err?.message?.includes('wishlists_product_id_fkey')
          ? 'This product is not available for wishlist yet'
          : err?.message || 'Failed to add item to wishlist';
        alert(message);
      }

      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user || !accessToken) {
      showLoginPrompt('wishlist');
      return false;
    }

    const normalizedProductId = String(productId);
    const previousItems = items;

    setItems((current) => current.filter((item) => String(item.id) !== normalizedProductId));

    try {
      const updatedItems = await wishlistApi.removeFromWishlist(productId, accessToken);
      setItems(dedupeProducts(updatedItems));
      return true;
    } catch (err) {
      setItems(previousItems);

      if (err?.status === 401) {
        await logout();
      } else {
        console.warn('Failed to remove wishlist item', err);
        const message = err?.message?.includes('wishlists_product_id_fkey')
          ? 'This product is not available for wishlist yet'
          : err?.message || 'Failed to remove item from wishlist';
        alert(message);
      }

      return false;
    }
  };

  const isInWishlist = (productId) => {
    const normalizedProductId = String(productId);
    return items.some((item) => String(item.id) === normalizedProductId);
  };

  const toggleWishlist = async (product) => {
    if (product?.id === undefined || product?.id === null) return false;

    if (isInWishlist(product.id)) {
      return await removeFromWishlist(product.id);
    }

    return await addToWishlist(product);
  };

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
}
