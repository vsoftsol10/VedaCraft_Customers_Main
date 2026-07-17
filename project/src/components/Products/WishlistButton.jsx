import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
export default function WishlistButton({ product }) {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const wishlisted = isInWishlist(product.id);
    return (<button onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[TRACE] Frontend ProductCard -> WishlistButton product.id =', product.id);
            toggleWishlist(product);
        }} aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'} className={`w-7 h-7 rounded-full bg-white shadow flex items-center justify-center transition-all duration-200 hover:scale-110 ${wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`} data-id={product.id}>
      <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`}/>
    </button>);
}
