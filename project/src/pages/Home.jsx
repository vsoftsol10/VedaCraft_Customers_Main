import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import HeroBanner from '../components/Hero/HeroBanner';
import CategorySection from '../components/Categories/CategorySection';
import ProductSection from '../components/Products/ProductSection';
import { useTranslation } from 'react-i18next';
import { allProducts } from '../data/allProducts';
import { mapLocalProductToProduct, mapApiProductToProduct } from '../types/product';
import { getProducts } from '../services/productApi';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { t } = useTranslation();
    const { selectedLocation } = useAuth();
    const [bestSellers, setBestSellers] = useState(() =>
        allProducts.filter((product) => product.section === 'bestsellers').map(mapLocalProductToProduct)
    );
    const [newArrivals, setNewArrivals] = useState(() =>
        allProducts.filter((product) => product.section === 'newarrivals').map(mapLocalProductToProduct)
    );
    const [trending, setTrending] = useState(() =>
        allProducts.filter((product) => product.section === 'trending').map(mapLocalProductToProduct)
    );
    const [subscribeEmail, setSubscribeEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!subscribeEmail.trim()) return;
        setSubscribed(true);
        setSubscribeEmail('');
        setTimeout(() => setSubscribed(false), 4000);
    };

    useEffect(() => {
        const fetchBackendProducts = async () => {
            try {
                // Fetch products from backend (limit 100 to ensure we get all homepage products)
                const response = await getProducts({ limit: 100 });
                const apiProducts = response.products || [];
                // Map API products to frontend domain model (camelCase)
                const domainApiProducts = apiProducts.map((p) => mapApiProductToProduct(p));
                if (domainApiProducts.length > 0) {
                    setBestSellers(domainApiProducts.slice(0, 10));
                    setNewArrivals(domainApiProducts.slice(10, 20).length ? domainApiProducts.slice(10, 20) : domainApiProducts.slice(0, 10));
                    setTrending(domainApiProducts.slice(20, 30).length ? domainApiProducts.slice(20, 30) : domainApiProducts.slice(0, 10));
                }
            }
            catch (error) {
                console.warn('Backend products API unavailable. Using fallback local products:', error);
            }
        };
        fetchBackendProducts();
    }, [selectedLocation]);

    return (
        <main className="bg-white">
            <HeroBanner />

            {/* Shop by Category */}
            <div className="bg-white">
                <CategorySection />
            </div>

            <ProductSection title={t('home.bestSellers')} products={bestSellers} />

            <div className="bg-gray-50">
                <ProductSection title={t('home.newArrivals')} products={newArrivals} />
            </div>

            <ProductSection title={t('home.trending')} products={trending} />

            {/* Newsletter Subscribe Banner */}
            <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pb-10 pt-2">
                <div className="bg-white border border-gray-200 rounded-xl px-5 sm:px-8 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-[#588122] flex-shrink-0" />
                        <p className="text-[#588122] font-medium text-sm sm:text-base">
                            {t('home.subscribeText', 'Get exclusive offer & Straight to your inbox!')}
                        </p>
                    </div>

                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row md:flex-row w-full md:w-[460px] lg:w-[540px]">
                        <div className="flex w-full">
                            <input
                                type="email"
                                required
                                value={subscribeEmail}
                                onChange={(e) => setSubscribeEmail(e.target.value)}
                                placeholder={t('home.subscribePlaceholder', 'Enter your email')}
                                className="flex-1 h-11 px-4 text-sm text-gray-800 placeholder-gray-400 bg-white border border-gray-400 border-r-0 rounded-l-[4px] focus:outline-none focus:border-[#5E9329]"
                            />
                            <button
                                type="submit"
                                className="h-11 px-7 sm:px-10 bg-[#639A30] hover:bg-[#538227] text-white text-sm font-medium rounded-r-[4px] transition-colors cursor-pointer whitespace-nowrap"
                            >
                                {subscribed ? t('home.subscribed', 'Subscribed!') : t('home.subscribeBtn', 'Subscribe')}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
