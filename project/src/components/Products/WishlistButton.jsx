import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../context/WishlistContext';

export default function WishlistButton({ product }) {
  const { t } = useTranslation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    await toggleWishlist(product);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={wishlisted ? t('wishlist.remove', 'Remove from wishlist') : t('wishlist.add', 'Add to wishlist')}
      className={`w-7 h-7 rounded-full bg-white shadow flex items-center justify-center transition-all duration-200 hover:scale-110 z-30 ${
        wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
      }`}
      data-id={product.id}
    >
      <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
    </button>
  );
}
