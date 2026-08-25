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
                if (domainApiProducts.length > 0) {
                    setBestSellers(domainApiProducts.slice(0, 10));
                    setNewArrivals((domainApiProducts.slice(10, 20).length ? domainApiProducts.slice(10, 20) : domainApiProducts.slice(0, 10)));
                    setTrending((domainApiProducts.slice(20, 30).length ? domainApiProducts.slice(20, 30) : domainApiProducts.slice(0, 10)));
                }
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
