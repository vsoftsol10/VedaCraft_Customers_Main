import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WishlistButton from './WishlistButton';
import { useCart } from '../../context/CartContext';
import { getProductPricing, isOfferActive } from '../../utils/pricing';

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
    : 'Eco-Craft';

  return (
    <div
      className="w-[250px] min-w-[250px] h-[240px] flex-shrink-0 bg-white rounded-[10px] border border-[#EFEFEF] overflow-hidden p-2 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 group"
      style={{
        boxShadow: '2px 2px 2px 0px rgba(197, 197, 197, 0.1)',
      }}
    >
      {/* Top Image area */}
      <div className="relative w-full h-[115px] rounded-[8px] overflow-hidden bg-gray-50 flex-shrink-0">
        <Link to={`/product/${encodeURIComponent(product.slug || product.id)}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        <div className="absolute top-1.5 right-1.5 z-20">
          <WishlistButton product={product} />
        </div>

        {isOutOfStock && (
          <div className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
            Out of stock
          </div>
        )}
        {isOfferActive(product.activeOffer) && !isOutOfStock && (
          <div className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            {product.activeOffer.name}
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 justify-between pt-1">
        <div>
          <Link to={`/product/${encodeURIComponent(product.slug || product.id)}`} className="hover:text-green-600 transition-colors">
            <h3 className="text-[12px] font-semibold text-gray-900 leading-tight truncate" title={product.name}>
              {t(`productsData.${product.name}`, product.name)}
            </h3>
          </Link>
          <p className="text-[10px] text-green-600 font-medium leading-tight mt-0.5">
            {categoryLabel}
          </p>
        </div>

        {/* Price & Rating */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[14px] font-bold text-gray-900 leading-none">
            &#8377; {displayPrice}
          </span>
          <div className="flex items-center gap-0.5">
            <span className="text-[11px] text-gray-500 font-medium leading-none">{product.rating || '4.8'}</span>
            <Star className="w-3 h-3 fill-green-600 text-green-600" />
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-end pt-1">
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
                activeOffer: product.activeOffer,
                image: product.image,
                quantity: 1,
                stock: hasKnownStock ? stockQuantity : undefined,
                rating: product.rating,
              });
            }}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] border text-[11px] font-semibold transition-all duration-150 active:scale-95 disabled:cursor-not-allowed ${
              isOutOfStock
                ? 'border-gray-200 bg-gray-100 text-gray-400'
                : 'border-green-600 text-green-700 bg-white hover:bg-green-600 hover:text-white'
            }`}
          >
            <span>{isOutOfStock ? t('filter.outOfStock', 'Out of Stock') : t('productCard.add', 'Add')}</span>
            <ShoppingCart className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

