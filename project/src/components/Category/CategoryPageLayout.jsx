import { useEffect, useMemo, useState } from 'react';
import { Star, ShoppingCart, Heart, ShoppingBag, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductsByCategory } from '../../services/productApi';
import { mapApiProductToProduct, mapLocalProductToProduct } from '../../types/product';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductPricing } from '../../utils/pricing';
import { useAuth } from '../../context/AuthContext';

function FilterSection({ title, items, selected, onToggle, formatItem = (item) => item }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-gray-100 pb-4 mb-4">
            <button className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-800" onClick={() => setOpen((o) => !o)}>
                {title}
                {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>
            {open && (
                <div className="space-y-2">
                    {items.map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} className="accent-green-600 w-4 h-4 rounded" />
                            <span className="text-sm text-gray-600 group-hover:text-green-700 transition-colors">{formatItem(item)}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
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
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
            <div className="relative overflow-hidden bg-gray-50 aspect-square">
                <Link to={`/product/${encodeURIComponent(product.slug || product.id)}`} className="block w-full h-full">
                    <img src={product.image} alt={t(`productsData.${product.name}`, product.name)} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                </Link>
                {/* Wishlist */}
                <button onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product);
                }} className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md transition-all duration-200 hover:scale-110 ${wished ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                    <Heart className={`w-4 h-4 ${wished ? 'fill-red-500' : ''}`} />
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
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-gray-600 font-medium">{product.rating}</span>
                    </div>
                </div>

                {/* Add to Cart */}
                <button disabled={isOutOfStock} onClick={handleAdd} className={`mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 ${isOutOfStock
                    ? 'border border-gray-200 bg-gray-100 text-gray-400'
                    : added
                        ? 'bg-green-600 text-white'
                        : 'border border-green-500 text-green-600 hover:bg-green-600 hover:text-white'}`}>
                    <ShoppingCart className="w-3 h-3" />
                    {isOutOfStock ? t('filter.outOfStock', 'Out of stock') : added ? t('productCard.addedToCart') : t('productCard.add')}
                </button>
            </div>
        </div>
    );
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

    const normalizeProduct = (product) => {
        return 'slug' in product && 'stock' in product ? product : mapLocalProductToProduct(product);
    };

    const [products, setProducts] = useState(() => (initialProducts ? initialProducts.map(normalizeProduct) : []));
    const [isLoading, setIsLoading] = useState(!initialProducts || initialProducts.length === 0);
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
                // Map the title of the category page to the backend category slug
                const categoryMap = {
                    'Eco-Friendly Products': 'eco',
                    'Wellness Products': 'wellness',
                    'Organic Food': 'food',
                    'Artisan Crafts': 'craft',
                    'Sustainable Fashion': 'fashion',
                    'Home Decor Items': 'decor',
                };
                const categorySlug = apiCategory || categoryMap[title] || title?.toLowerCase?.() || '';
                if (!categorySlug) return;
                // Fetch products only for this category from the backend
                const response = await getProductsByCategory(categorySlug, { limit: 100 });
                const apiProducts = response.products || [];
                // Map API products to frontend domain model (camelCase)
                const domainApiProducts = apiProducts.map((p) => mapApiProductToProduct(p));
                if (mounted) {
                    if (domainApiProducts.length > 0) {
                        setProducts(domainApiProducts);
                    } else if (initialProducts && initialProducts.length > 0) {
                        setProducts(initialProducts.map(normalizeProduct));
                    }
                }
            }
            catch (error) {
                console.warn('Failed to load category products from backend. Using fallback local products:', error);
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
        .map((product) => product.specifications?.subCategory || product.category)
        .filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)), [products]);

    const discountOptions = useMemo(() => [10, 20, 30, 40, 50, 60, 80]
        .filter((minimum) => products.some((product) => {
            const pricing = getProductPricing(product);
            return pricing.mrp > 0 && ((pricing.mrp - pricing.salePrice) / pricing.mrp) * 100 >= minimum;
        })), [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const pricing = getProductPricing(product);
            const price = pricing.salePrice;
            const stockValue = product.stock ?? product.quantity;
            const hasKnownStock = stockValue !== undefined && stockValue !== null && Number.isFinite(Number(stockValue));
            const isOutOfStock = hasKnownStock && Number(stockValue) <= 0;
            // subCategories
            if (filters.subCategories.length > 0) {
                const subCat = product.specifications?.subCategory || product.category;
                if (!subCat || !filters.subCategories.includes(subCat))
                    return false;
            }
            // inStock / outOfStock
            if (filters.inStock && isOutOfStock)
                return false;
            if (filters.outOfStock && !isOutOfStock)
                return false;
            // priceMax
            if (price > filters.priceMax)
                return false;
            // discounts
            if (filters.discounts.length > 0) {
                const discountPercent = pricing.mrp > 0
                    ? Math.round(((pricing.mrp - pricing.salePrice) / pricing.mrp) * 100)
                    : 0;
                if (!filters.discounts.some((minimum) => discountPercent >= minimum))
                    return false;
            }
            return true;
        });
    }, [products, filters]);

    const sortedProducts = useMemo(() => {
        const sorted = [...filteredProducts];
        if (sortBy === 'price-low') {
            sorted.sort((a, b) => getProductPricing(a).salePrice - getProductPricing(b).salePrice);
        }
        else if (sortBy === 'price-high') {
            sorted.sort((a, b) => getProductPricing(b).salePrice - getProductPricing(a).salePrice);
        }
        else if (sortBy === 'rating') {
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
        // 'featured' keeps original order
        return sorted;
    }, [filteredProducts, sortBy]);

    const FilterPanel = () => (
        <aside className="w-full space-y-1">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-green-700" />
                    {t('filter.filters')}
                </h2>
                {activeFiltersCount > 0 && (
                    <button onClick={clearAll} className="flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium transition-colors">
                        <X className="w-3 h-3" /> {t('filter.clearAll')} ({activeFiltersCount})
                    </button>
                )}
            </div>

            <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{t('filter.price')}</span>
                    <span className="font-semibold text-gray-800">&#8377; {filters.priceMax}</span>
                </div>
                <input type="range" min="100" max="5000" step="100" value={filters.priceMax} onChange={(e) => setFilters((f) => ({ ...f, priceMax: Number(e.target.value) }))} className="w-full accent-green-600 cursor-pointer" />
            </div>

            {subCategories.length > 0 && (
                <FilterSection title={t('filter.subCategory', 'Sub-category')} items={subCategories} selected={filters.subCategories} onToggle={(item) => toggleFilter('subCategories', item)} />
            )}
            {discountOptions.length > 0 && (
                <FilterSection title={t('filter.discount')} items={discountOptions} selected={filters.discounts} onToggle={(item) => toggleFilter('discounts', item)} formatItem={(minimum) => t('filter.discountOff', { minimum, defaultValue: `${minimum}% off & above` })} />
            )}

            <div className="pb-4">
                <p className="text-sm font-semibold text-gray-800 mb-3">{t('filter.availability')}</p>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={filters.inStock} onChange={(e) => setFilters((f) => ({ ...f, inStock: e.target.checked }))} className="accent-green-600 w-4 h-4 rounded" />
                        <span className="text-sm text-gray-600 group-hover:text-green-700 transition-colors">{t('filter.inStock')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={filters.outOfStock} onChange={(e) => setFilters((f) => ({ ...f, outOfStock: e.target.checked }))} className="accent-green-600 w-4 h-4 rounded" />
                        <span className="text-sm text-gray-600 group-hover:text-green-700 transition-colors">{t('filter.outOfStock')}</span>
                    </label>
                </div>
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header info */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{displayTitle}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('filter.showing')} <span className="font-semibold text-gray-800">{sortedProducts.length}</span> {t('filter.products')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="featured">{t('filter.sortFeatured')}</option>
                            <option value="price-low">{t('filter.sortPriceLow')}</option>
                            <option value="price-high">{t('filter.sortPriceHigh')}</option>
                            <option value="rating">{t('filter.sortBestRated')}</option>
                        </select>

                        <button onClick={() => setMobileFiltersOpen(true)} className="md:hidden flex items-center gap-1.5 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700">
                            <SlidersHorizontal className="w-4 h-4 text-green-700" />
                            {t('filter.filters')}
                            {activeFiltersCount > 0 && (<span className="w-4 h-4 rounded-full bg-green-600 text-white text-[10px] flex items-center justify-center font-bold">
                                {activeFiltersCount}
                            </span>)}
                        </button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Filter Panel */}
                    <div className="hidden md:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
                            <FilterPanel />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-3">
                                        <div className="bg-gray-200 aspect-square rounded-xl" />
                                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : sortedProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-base font-semibold text-gray-700">{t('filter.noProducts')}</h3>
                                <p className="text-xs text-gray-400 mt-1">{t('filter.clearFilters')}</p>
                                {activeFiltersCount > 0 && (<button onClick={clearAll} className="mt-4 px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    {t('filter.clearAll')}
                                </button>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {sortedProducts.map((product) => (<ProductCard key={product.id} product={product} />))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="relative ml-auto w-full max-w-xs bg-white h-full overflow-y-auto p-6 shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                            <h2 className="text-base font-bold text-gray-800">{t('filter.filters')}</h2>
                            <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <FilterPanel />
                    </div>
                </div>
            )}
        </div>
    );
}
