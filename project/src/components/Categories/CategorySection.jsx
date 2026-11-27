import { useTranslation } from 'react-i18next';
import CategoryCard from './CategoryCard';
import categories from '../../data/categories';

export default function CategorySection() {
    const { t } = useTranslation();

    return (
        <section className="py-6 sm:py-8 lg:py-10 bg-white">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">
                    {t('home.shopByCategory', 'Shop by Category')}
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {categories.map((category) => (
                        <CategoryCard key={category.id || category.slug} category={category} />
                    ))}
                </div>
            </div>
        </section>
    );
}


