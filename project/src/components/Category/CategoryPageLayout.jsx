import { useEffect, useMemo, useState } from 'react';
import { Star, ShoppingCart, Heart, ShoppingBag, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductsByCategory } from '../../services/productApi';
import { mapApiProductToProduct } from '../../types/product';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductPricing } from '../../utils/pricing';
import { useAuth } from '../../context/AuthContext';
function FilterSection({ title, items, selected, onToggle, formatItem = (item) => item }) {
    const [open, setOpen] = useState(true);
    return (<div className="border-b border-gray-100 pb-4 mb-4">
      <button className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-800" onClick={() => setOpen((o) => !o)}>
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-500"/> : <ChevronDown className="w-4 h-4 text-gray-500"/>}
      </button>
      {open && (<div className="space-y-2">
          {items.map((item) => (<label key={item} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} className="accent-green-600 w-4 h-4 rounded"/>
              <span className="text-sm text-gray-600 group-hover:text-green-700 transition-colors">{formatItem(item)}</span>
            </label>))}
        </div>)}
    </div>);
}
function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { t } = useTranslation();
    const wished = isInWishlist(product.id);
    const [added, setAdded] = useState(false);
    const pricing = getProductPricing(product);
    const displayPrice = pricing.salePrice;
    const stockValue = product.stock ?? product.quantity;
    const stockQuantity = Number(stockValue);
    const hasKnownStock = stockValue !== undefined && stockValue !== null && Number.isFinite(stockQuantity);
    const isOutOfStock = hasKnownStock && stockQuantity <= 0;
    const handleAdd = (e) => {
        e.preventDefault();
        if (isOutOfStock)
            return;
        const addedToCart = addToCart({
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
            rating: product.rating
        });
        if (!addedToCart) return;
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    };
    return (<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <Link to={`/product/${encodeURIComponent(product.slug || product.id)}`} className="block w-full h-full">
          <img src={product.image} alt={t(`productsData.${product.name}`, product.name)} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"/>
        </Link>
        {/* Wishlist */}
        <button onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
        }} className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md transition-all duration-200 hover:scale-110 ${wished ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
          <Heart className={`w-4 h-4 ${wished ? 'fill-red-500' : ''}`}/>
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <Link to={`/product/${encodeURIComponent(product.slug || product.id)}`} className="hover:text-green-600 transition-colors">
          <h3 className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{t(`productsData.${product.name}`, product.name)}</h3>
        </Link>
        <p className="text-[10px] text-green-600 font-medium">{t(`productsData.${product.category}`, product.category)}</p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-sm font-bold text-gray-900">&#8377; {displayPrice}</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
            <span className="text-[10px] text-gray-600 font-medium">{product.rating}</span>
          </div>
        </div>

        {/* Add to Cart */}
        <button disabled={isOutOfStock} onClick={handleAdd} className={`mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 ${isOutOfStock
            ? 'border border-gray-200 bg-gray-100 text-gray-400'
            : added
                ? 'bg-green-600 text-white'
                : 'border border-green-500 text-green-600 hover:bg-green-600 hover:text-white'}`}>
          <ShoppingCart className="w-3 h-3"/>
          {isOutOfStock ? 'Out of stock' : added ? t('productCard.addedToCart') : t('productCard.add')}
        </button>


      </div>
    </div>);
}
export default function CategoryPageLayout({ title, icon: Icon = ShoppingBag, products: initialProducts, apiCategory }) {
    const { t } = useTranslation();
    const { selectedLocation } = useAuth();
    const pageKeyMap = {
        'Eco-Friendly Products': 'eco',
        'Wellness Products': 'wellness',
        'Organic Food': 'food',
        'Artisan Crafts': 'craft',
        'Sustainable Fashion': 'fashion',
        'Home Decor Items': 'decor',
    };
    const pageKey = pageKeyMap[title];
    const displayTitle = pageKey ? t(`pages.${pageKey}.title`, title) : title;
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        subCategories: [],
        discounts: [],
        priceMax: 5000,
        inStock: false,
        outOfStock: false,
    });
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [sortBy, setSortBy] = useState('featured');
    useEffect(() => {
        let mounted = true;
        const loadProducts = async () => {
            try {
                setIsLoading(true);
                // Map the title of the category page to the backend category slug
                const categoryMap = {
                    'Eco-Friendly Products': 'eco',
                    'Wellness Products': 'wellness',
                    'Organic Food': 'food',
                    'Artisan Crafts': 'craft',
                    'Sustainable Fashion': 'fashion',
                    'Home Decor Items': 'decor',
                };
                const categorySlug = apiCategory || categoryMap[title] || title.toLowerCase();
                // Fetch products only for this category from the backend
                const response = await getProductsByCategory(categorySlug, { limit: 100 });
                const apiProducts = response.products;
                // Map API products to frontend domain model (camelCase)
                const domainApiProducts = apiProducts.map((p) => mapApiProductToProduct(p));
                if (mounted) {
                    setProducts(domainApiProducts);
                }
            }
            catch (error) {
                console.warn('Failed to load category products from backend:', error);
                if (mounted) setProducts([]);
            }
            finally {
                if (mounted)
                    setIsLoading(false);
            }
        };
        loadProducts();
        return () => {
            mounted = false;
        };
    }, [apiCategory, initialProducts, title, selectedLocation]);
    const toggleFilter = (key, item) => {
        setFilters((f) => ({
            ...f,
            [key]: f[key].includes(item) ? f[key].filter((x) => x !== item) : [...f[key], item],
        }));
    };
    const clearAll = () => setFilters({ subCategories: [], discounts: [], priceMax: 5000, inStock: false, outOfStock: false });
    const activeFiltersCount = filters.subCategories.length + filters.discounts.length +
        (filters.inStock ? 1 : 0) + (filters.outOfStock ? 1 : 0);
    const subCategories = useMemo(() => [...new Set(products
        .map((product) => product.specifications?.subCategory)
        .filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)), [products]);
    const discountOptions = useMemo(() => [10, 20, 30, 40, 50, 60, 80]
        .filter((minimum) => products.some((product) => {
            const pricing = getProductPricing(product);
            return pricing.mrp > 0 && ((pricing.mrp - pricing.salePrice) / pricing.mrp) * 100 >= minimum;
        })), [products]);
    const filteredProducts = useMemo(() => {
        const filtered = products.filter((product) => {
            // 1. Sub-category comes directly from seller_products.sub_category.
            const subCategory = product.specifications?.subCategory;
            if (filters.subCategories.length > 0 && !filters.subCategories.includes(subCategory)) {
                return false;
            }
            // 2. Price
            if (getProductPricing(product).salePrice > filters.priceMax) {
                return false;
            }
            // 3. Availability
            const stockValue = product.stock ?? product.quantity;
            const stockQuantity = Number(stockValue);
            const isOutOfStock = stockValue !== undefined && stockValue !== null && Number.isFinite(stockQuantity) && stockQuantity <= 0;
            if (filters.inStock && !filters.outOfStock && isOutOfStock)
                return false;
            if (filters.outOfStock && !filters.inStock && !isOutOfStock)
                return false;
            // 4. Discount is calculated from the product's MRP and selling price.
            if (filters.discounts.length > 0) {
                const pricing = getProductPricing(product);
                const discountPercent = pricing.mrp > 0
                    ? ((pricing.mrp - pricing.salePrice) / pricing.mrp) * 100
                    : 0;
                if (!filters.discounts.some((minimum) => discountPercent >= minimum))
                    return false;
            }
            return true;
        });
        // Apply sorting
        const sorted = [...filtered];
        if (sortBy === 'price-asc') {
            sorted.sort((a, b) => getProductPricing(a).salePrice - getProductPricing(b).salePrice);
        }
        else if (sortBy === 'price-desc') {
            sorted.sort((a, b) => getProductPricing(b).salePrice - getProductPricing(a).salePrice);
        }
        else if (sortBy === 'best-rated') {
            sorted.sort((a, b) => b.rating - a.rating);
        }
        // 'featured' keeps original order
        return sorted;
    }, [products, filters, sortBy]);
    const FilterPanel = () => (<aside className="w-full space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-green-600"/> {t('filter.filter')}
        </h2>
        {activeFiltersCount > 0 && (<button onClick={clearAll} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors">
            <X className="w-3 h-3"/> {t('filter.clearAll')} ({activeFiltersCount})
          </button>)}
      </div>

      <div className="border-b border-gray-100 pb-4 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('filter.price')}</p>
        <input type="range" min={0} max={5000} value={filters.priceMax} onChange={(e) => setFilters((f) => ({ ...f, priceMax: Number(e.target.value) }))} className="w-full accent-green-600"/>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>₹0</span>
          <span className="text-green-700 font-semibold">₹{filters.priceMax}</span>
          <span>₹5000</span>
        </div>
      </div>

      <FilterSection title="Sub-category" items={subCategories} selected={filters.subCategories} onToggle={(item) => toggleFilter('subCategories', item)}/>
      <FilterSection title={t('filter.discount')} items={discountOptions} selected={filters.discounts} onToggle={(item) => toggleFilter('discounts', item)} formatItem={(minimum) => `${minimum}% off & above`}/>

      <div className="pb-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">{t('filter.availability')}</p>
        <div className="space-y-2">
          {[
            { label: t('filter.inStock'), key: 'inStock' },
            { label: t('filter.outOfStock'), key: 'outOfStock' },
        ].map(({ label, key }) => (<label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={filters[key]} onChange={() => setFilters((f) => ({ ...f, [key]: !f[key] }))} className="accent-green-600 w-4 h-4"/>
              <span className="text-sm text-gray-600 group-hover:text-green-700 transition-colors">{label}</span>
            </label>))}
        </div>
      </div>
    </aside>);
    return (<div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-gray-500 text-sm">
          <Link to="/" className="hover:text-green-600 transition-colors">{t('filter.home')}</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{displayTitle}</span>
        </nav>
      </div>

      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-3 shadow-sm">
        <span className="text-sm font-medium text-gray-700">
          {filteredProducts.length} {t('filter.products')}
        </span>
        <button onClick={() => setMobileFiltersOpen((o) => !o)} className="flex items-center gap-2 text-sm font-semibold text-green-700 border border-green-400 px-3 py-1.5 rounded-lg">
          <SlidersHorizontal className="w-4 h-4"/>
          {t('filter.filters')} {activeFiltersCount > 0 && <span className="bg-green-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
        </button>
      </div>

      {mobileFiltersOpen && (<div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)}/>
          <div className="relative bg-white w-72 h-full overflow-y-auto p-5 shadow-xl">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={() => setMobileFiltersOpen(false)}>
              <X className="w-5 h-5"/>
            </button>
            <FilterPanel />
          </div>
        </div>)}

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 flex gap-6">
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-4">
            <FilterPanel />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <p className="text-sm text-gray-600">
              {t('filter.showing')} <span className="font-semibold text-gray-800">{filteredProducts.length}</span> {t('filter.products')}
            </p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer">
              <option value="featured">{t('filter.sortFeatured')}</option>
              <option value="price-asc">{t('filter.sortPriceLow')}</option>
              <option value="price-desc">{t('filter.sortPriceHigh')}</option>
              <option value="best-rated">{t('filter.sortBestRated')}</option>
            </select>
          </div>

          {isLoading ? (<div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <p className="text-base font-medium">{t('filter.loadingProducts')}</p>
            </div>) : filteredProducts.length === 0 ? (<div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Icon className="w-12 h-12 mb-3 text-gray-300"/>
              <p className="text-base font-medium">{t('filter.noProducts')}</p>
              <button onClick={clearAll} className="mt-3 text-sm text-green-600 underline">{t('filter.clearFilters')}</button>
            </div>) : (<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (<ProductCard key={product.id} product={product}/>))}
            </div>)}
        </main>
      </div>
    </div>);
}
