import { useEffect, useMemo, useState } from 'react';
import { Star, ShoppingCart, Heart, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductsByCategory } from '../../services/productApi';
import { mapApiProductToProduct, mapLocalProductToProduct } from '../../types/product';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
function FilterSection({ title, items, selected, onToggle, }) {
    const [open, setOpen] = useState(true);
    const { t } = useTranslation();
    return (<div className="border-b border-gray-100 pb-4 mb-4">
      <button className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-800" onClick={() => setOpen((o) => !o)}>
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-500"/> : <ChevronDown className="w-4 h-4 text-gray-500"/>}
      </button>
      {open && (<div className="space-y-2">
          {items.map((item) => (<label key={item} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} className="accent-green-600 w-4 h-4 rounded"/>
              <span className="text-sm text-gray-600 group-hover:text-green-700 transition-colors">{t(`filtersData.${item}`, item)}</span>
            </label>))}
        </div>)}
    </div>);
}
function ProductCard({ product, badgeIcon: BadgeIcon, badgeText, badgeColorClass }) {
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { t } = useTranslation();
    const wished = isInWishlist(product.id);
    const [added, setAdded] = useState(false);
    const handleAdd = (e) => {
        e.preventDefault();
        const addedToCart = addToCart({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            rating: product.rating
        });
        if (!addedToCart) return;
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    };
    return (<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <Link to={`/product/${product.slug || product.id}`} className="block w-full h-full">
          <img src={product.image} alt={t(`productsData.${product.name}`, product.name)} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"/>
        </Link>
        {/* Badge */}
        <div className="absolute top-2 left-2">
          <span className={`flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColorClass}`}>
            <BadgeIcon className="w-2.5 h-2.5"/> {badgeText}
          </span>
        </div>
        {/* Wishlist */}
        <button onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
        }} className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md transition-all duration-200 hover:scale-110 ${wished ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
          <Heart className={`w-4 h-4 ${wished ? 'fill-red-500' : ''}`}/>
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <Link to={`/product/${product.slug || product.id}`} className="hover:text-green-600 transition-colors">
          <h3 className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{t(`productsData.${product.name}`, product.name)}</h3>
        </Link>
        <p className="text-[10px] text-green-600 font-medium">{t(`productsData.${product.category}`, product.category)}</p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-sm font-bold text-gray-900">₹ {product.price}</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
            <span className="text-[10px] text-gray-600 font-medium">{product.rating}</span>
          </div>
        </div>

        {/* Add to Cart */}
        <button onClick={handleAdd} className={`mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all duration-200 active:scale-95 ${added
            ? 'bg-green-600 text-white'
            : 'border border-green-500 text-green-600 hover:bg-green-600 hover:text-white'}`}>
          <ShoppingCart className="w-3 h-3"/>
          {added ? t('productCard.addedToCart') : t('productCard.add')}
        </button>


      </div>
    </div>);
}
export default function CategoryPageLayout({ title, icon: Icon, badgeColorClass, products: initialProducts, apiCategory, categories, features, discounts, }) {
    const { t } = useTranslation();
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
    const normalizeProduct = (product) => {
        return 'slug' in product && 'stock' in product ? product : mapLocalProductToProduct(product);
    };
    const [products, setProducts] = useState(() => initialProducts ? initialProducts.map(normalizeProduct) : []);
    const [isLoading, setIsLoading] = useState(!initialProducts);
    const [filters, setFilters] = useState({
        categories: [],
        features: [],
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
                const response = await getProductsByCategory(categorySlug);
                const apiProducts = response.products;
                // Map API products to frontend domain model (camelCase)
                const domainApiProducts = apiProducts.map((p) => mapApiProductToProduct(p));
                // Create a lookup map of slug -> DomainProduct
                const apiProductMap = new Map();
                domainApiProducts.forEach((p) => {
                    if (p.slug) {
                        apiProductMap.set(p.slug, p);
                    }
                });
                if (mounted) {
                    if (initialProducts) {
                        // Merge backend data into local products using slug mapping
                        const mergeProduct = (localProd) => {
                            const normalizedLocal = normalizeProduct(localProd);
                            const backendProd = apiProductMap.get(normalizedLocal.slug);
                            if (backendProd) {
                                return {
                                    ...normalizedLocal,
                                    id: backendProd.id, // Use backend ID (1-61) instead of local ID (101+)
                                    price: backendProd.price,
                                    discountPrice: backendProd.discountPrice,
                                    stock: backendProd.stock,
                                    rating: backendProd.rating,
                                    totalReviews: backendProd.totalReviews,
                                    image: backendProd.image || normalizedLocal.image,
                                    images: backendProd.images?.length ? backendProd.images : normalizedLocal.images,
                                };
                            }
                            return normalizedLocal;
                        };
                        const mergedProducts = initialProducts.map(mergeProduct);
                        setProducts(mergedProducts);
                    }
                    else {
                        setProducts(domainApiProducts);
                    }
                }
            }
            catch (error) {
                console.warn('Failed to load category products from backend, falling back to local data:', error);
                if (mounted && initialProducts) {
                    setProducts(initialProducts.map(normalizeProduct));
                }
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
    }, [apiCategory, initialProducts, title]);
    const toggleFilter = (key, item) => {
        setFilters((f) => ({
            ...f,
            [key]: f[key].includes(item) ? f[key].filter((x) => x !== item) : [...f[key], item],
        }));
    };
    const clearAll = () => setFilters({ categories: [], features: [], discounts: [], priceMax: 5000, inStock: false, outOfStock: false });
    const activeFiltersCount = filters.categories.length + filters.features.length + filters.discounts.length +
        (filters.inStock ? 1 : 0) + (filters.outOfStock ? 1 : 0);
    const filteredProducts = useMemo(() => {
        const filtered = products.filter((product) => {
            // 1. Category
            if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
                return false;
            }
            // 2. Price
            if (product.price > filters.priceMax) {
                return false;
            }
            // 3. Availability (Pseudo-random: ID % 7 == 0 is Out of Stock)
            const isOutOfStock = product.id % 7 === 0;
            if (filters.inStock && !filters.outOfStock && isOutOfStock)
                return false;
            if (filters.outOfStock && !filters.inStock && !isOutOfStock)
                return false;
            // 4. Features
            if (filters.features.length > 0) {
                const feature1 = features[product.id % features.length];
                const feature2 = features[(product.id * 2) % features.length];
                const productFeatures = [feature1, feature2];
                const hasFeature = filters.features.some(f => productFeatures.includes(f));
                if (!hasFeature)
                    return false;
            }
            // 5. Discount
            if (filters.discounts.length > 0) {
                const productDiscount = discounts[product.id % discounts.length];
                if (!filters.discounts.includes(productDiscount))
                    return false;
            }
            return true;
        });
        // Apply sorting
        const sorted = [...filtered];
        if (sortBy === 'price-asc') {
            sorted.sort((a, b) => a.price - b.price);
        }
        else if (sortBy === 'price-desc') {
            sorted.sort((a, b) => b.price - a.price);
        }
        else if (sortBy === 'best-rated') {
            sorted.sort((a, b) => b.rating - a.rating);
        }
        // 'featured' keeps original order
        return sorted;
    }, [products, filters, features, discounts, sortBy]);
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

      <FilterSection title={t('filter.category')} items={categories} selected={filters.categories} onToggle={(item) => toggleFilter('categories', item)}/>
      <FilterSection title={t('filter.features')} items={features} selected={filters.features} onToggle={(item) => toggleFilter('features', item)}/>
      <FilterSection title={t('filter.discount')} items={discounts} selected={filters.discounts} onToggle={(item) => toggleFilter('discounts', item)}/>

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

      <div className="md:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
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
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {t('filter.showing')} <span className="font-semibold text-gray-800">{filteredProducts.length}</span> {t('filter.products')}
            </p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer">
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
            </div>) : (<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (<ProductCard key={product.id} product={product} badgeIcon={Icon} badgeText={displayTitle.split(' ')[0]} badgeColorClass={badgeColorClass}/>))}
            </div>)}
        </main>
      </div>
    </div>);
}
