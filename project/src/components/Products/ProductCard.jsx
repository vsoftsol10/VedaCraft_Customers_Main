import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WishlistButton from './WishlistButton';
import { useCart } from '../../context/CartContext';
import { getProductPricing } from '../../utils/pricing';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const pricing = getProductPricing(product);
  const displayPrice = pricing.salePrice;
  const stockValue = product.quantity ?? product.stock;
  const stockQuantity = Number(stockValue);
  const hasKnownStock = stockValue !== undefined && stockValue !== null && Number.isFinite(stockQuantity);
  const isOutOfStock = hasKnownStock && stockQuantity <= 0;
  const categoryLabel = product.category
    ? t(`productsData.${product.category}`, product.category)
    : 'Product';

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group flex flex-col">
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <Link to={`/product/${product.slug || product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        <div className="absolute top-2 right-2 z-30 pointer-events-auto">
          <WishlistButton product={product} />
        </div>
        {isOutOfStock && (
          <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Out of stock
          </div>
        )}
      </div>

      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <Link to={`/product/${product.slug || product.id}`} className="hover:text-green-600 transition-colors">
          <h3 className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">
            {t(`productsData.${product.name}`, product.name)}
          </h3>
        </Link>

        <p className="text-[10px] text-green-600 font-medium">
          {categoryLabel}
        </p>

        <div className="flex items-center justify-between mt-auto pt-1.5">
          <span className="text-sm font-bold text-gray-800">&#8377; {displayPrice}</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] text-gray-600 font-medium">{product.rating}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => {
            if (isOutOfStock) return;
            addToCart({
              id: product.id,
              slug: product.slug,
              name: product.name,
              category: product.category,
              price: displayPrice,
              originalPrice: pricing.mrp,
              discountPrice: pricing.hasDiscount ? displayPrice : null,
              offer: product.offer,
              image: product.image,
              quantity: 1,
              stock: hasKnownStock ? stockQuantity : undefined,
              rating: product.rating,
            });
          }}
          className={`mt-1.5 w-full flex items-center justify-center gap-1.5 border text-xs font-semibold py-1.5 rounded-md transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 ${
            isOutOfStock
              ? 'border-gray-200 bg-gray-100 text-gray-400'
              : 'border-green-500 text-green-600 hover:bg-green-600 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3 h-3" />
          {isOutOfStock ? 'Out of stock' : 'Add'}
        </button>
      </div>
    </div>
  );
}
