import { useEffect, useState } from 'react';
import HeroBanner from '../components/Hero/HeroBanner';
import CategorySection from '../components/Categories/CategorySection';
import ProductSection from '../components/Products/ProductSection';
import { useTranslation } from 'react-i18next';
import { allProducts } from '../data/allProducts';
import { mapLocalProductToProduct, mapApiProductToProduct } from '../types/product';
import { getProducts } from '../services/productApi';
export default function Home() {
    const { t } = useTranslation();
    // Initialize state with local product data
    const [bestSellers, setBestSellers] = useState(() => allProducts.filter((product) => product.section === 'bestsellers').map(mapLocalProductToProduct));
    const [newArrivals, setNewArrivals] = useState(() => allProducts.filter((product) => product.section === 'newarrivals').map(mapLocalProductToProduct));
    const [trending, setTrending] = useState(() => allProducts.filter((product) => product.section === 'trending').map(mapLocalProductToProduct));
    useEffect(() => {
        const fetchBackendProducts = async () => {
            try {
                // Fetch products from backend (limit 100 to ensure we get all homepage products)
                const response = await getProducts({ limit: 100 });
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
                // Merge backend data into local products
                const mergeProduct = (localProd) => {
                    const backendProd = apiProductMap.get(localProd.slug);
                    if (backendProd) {
                        return {
                            ...localProd,
                            slug: backendProd.slug || localProd.slug,
                            image: backendProd.image || localProd.image,
                            images: backendProd.images?.length ? backendProd.images : (localProd.images || [localProd.image]),
                            id: backendProd.id, // Use backend ID
                            price: backendProd.price,
                            discountPrice: backendProd.discountPrice,
                            stock: backendProd.stock,
                            rating: backendProd.rating,
                            totalReviews: backendProd.totalReviews,
                            isFeatured: backendProd.isFeatured,
                            createdAt: backendProd.createdAt,
                            updatedAt: backendProd.updatedAt,
                            // Preserve local image, section, ordering, and UI metadata
                        };
                    }
                    return localProd;
                };
                setBestSellers((prev) => prev.map(mergeProduct));
                setNewArrivals((prev) => prev.map(mergeProduct));
                setTrending((prev) => prev.map(mergeProduct));
            }
            catch (error) {
                console.warn('Backend products API unavailable. Falling back to local data:', error);
                // Fallback is automatic since state is initialized with local data
            }
        };
        fetchBackendProducts();
    }, []);
    return (<main className="bg-white">
      <HeroBanner />

      {/* Shop by Category */}
      <div className="bg-gray-50">
        <CategorySection />
      </div>

      <ProductSection title={t('home.bestSellers')} products={bestSellers}/>

      <div className="bg-gray-50">
        <ProductSection title={t('home.newArrivals')} products={newArrivals}/>
      </div>

      <ProductSection title={t('home.trending')} products={trending}/>

      {/* Spacer before footer */}
      <div className="h-8"/>
    </main>);
}
