import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { getProductsByCategory } from '../../services/productApi';
import { mapApiProductToProduct, mapLocalProductToProduct } from '../../types/product';
import { useTranslation } from 'react-i18next';
import { getProductPricing } from '../../utils/pricing';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../Products/ProductCard';

function FilterSection({ title, items, selected, onToggle, formatItem = (item) => item }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-gray-100 pb-4 mb-4">
            <button className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-800" onClick={() => setOpen((o) => !o)}>{title}{open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}</button>
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
        const categoryMap = {
            'Eco-Friendly Products': 'eco',
            'Wellness Products': 'wellness',
            'Organic Food': 'food',
            'Artisan Crafts': 'craft',
            'Sustainable Fashion': 'fashion',
            'Home Decor Items': 'decor',
        };
        const categorySlug = apiCategory || categoryMap[title] || title?.toLowerCase?.() || '';

        const loadProducts = async () => {
            try {
                if (!categorySlug) return;
                const response = await getProductsByCategory(categorySlug, { limit: 100 });
                const apiProducts = response.products || [];
                const domainApiProducts = apiProducts.map((p) => mapApiProductToProduct(p));
                if (mounted) {
                    if (domainApiProducts.length > 0) {
                        setProducts(domainApiProducts);
                    } else if (initialProducts && initialProducts.length > 0) {
                        setProducts(initialProducts.map(normalizeProduct));
                    }
                }
            } catch (error) {
                console.warn('Failed to load category products from backend. Using fallback local products:', error);
                // Fallback: use local allProducts data filtered by category slug
                try {
                    const allProducts = await import('../../data/allProducts.js');
                    const fallbackProducts = allProducts.allProducts.filter(p => {
                        const mainCat = p.mainCategory || '';
                        const slug = p.slug || '';
                        const cat = p.category || '';
                        const lower = categorySlug.toLowerCase();
                        return (
                            mainCat.toLowerCase() === lower ||
                            slug.toLowerCase() === lower ||
                            cat.toLowerCase() === lower
                        );
                    }).map(mapLocalProductToProduct);
                    if (mounted) setProducts(fallbackProducts);
                } catch (fallbackError) {
                    console.error('Fallback local products also failed:', fallbackError);
                    if (mounted && initialProducts) {
                        setProducts(initialProducts.map(normalizeProduct));
                    }
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        loadProducts();
        return () => { mounted = false; };
    }, [apiCategory, initialProducts, title, selectedLocation]);

    const toggleFilter = (key, item) => {
        setFilters((f) => ({
            ...f,
            [key]: f[key].includes(item) ? f[key].filter((x) => x !== item) : [...f[key], item],
        }));
    };
    const clearAll = () => setFilters({ subCategories: [], discounts: [], priceMax: 5000, inStock: false, outOfStock: false });
    const activeFiltersCount = filters.subCategories.length + filters.discounts.length + (filters.inStock ? 1 : 0) + (filters.outOfStock ? 1 : 0);

    const subCategories = useMemo(() => [...new Set(products.map((p) => p.specifications?.subCategory || p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [products]);

    const discountOptions = useMemo(() => [10, 20, 30, 40, 50, 60, 80].filter((minimum) => products.some((product) => {
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
            if (filters.subCategories.length > 0) {
                const subCat = product.specifications?.subCategory || product.category;
                if (!subCat || !filters.subCategories.includes(subCat)) return false;
            }
            if (filters.inStock && isOutOfStock) return false;
            if (filters.outOfStock && !isOutOfStock) return false;
            if (price > filters.priceMax) return false;
            if (filters.discounts.length > 0) {
                const discountPercent = pricing.mrp > 0 ? Math.round(((pricing.mrp - pricing.salePrice) / pricing.mrp) * 100) : 0;
                if (!filters.discounts.some((minimum) => discountPercent >= minimum)) return false;
            }
            return true;
        });
    }, [products, filters]);

    const sortedProducts = useMemo(() => {
        const sorted = [...filteredProducts];
        if (sortBy === 'price-low') {
            sorted.sort((a, b) => getProductPricing(a).salePrice - getProductPricing(b).salePrice);
        } else if (sortBy === 'price-high') {
            sorted.sort((a, b) => getProductPricing(b).salePrice - getProductPricing(a).salePrice);
        } else if (sortBy === 'rating') {
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
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
                            {activeFiltersCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-green-600 text-white text-[10px] flex items-center justify-center font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
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
                    <div className="flex-1 min-w-0">
                        {isLoading ? (
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="w-[250px] h-[240px] bg-white rounded-[10px] p-2 border border-[#EFEFEF] animate-pulse space-y-3">
                                        <div className="bg-gray-200 h-[115px] rounded-[8px]" />
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
                                {activeFiltersCount > 0 && (
                                    <button onClick={clearAll} className="mt-4 px-4 py-2 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{t('filter.clearAll')}</button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
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
                            <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <FilterPanel />
                    </div>
                </div>
            )}
        </div>
    );
}
