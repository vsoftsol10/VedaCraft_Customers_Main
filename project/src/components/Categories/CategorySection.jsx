import { useTranslation } from 'react-i18next';
import categories from '../../data/categories';
import CategoryCard from './CategoryCard';
export default function CategorySection() {
    const { t } = useTranslation();
    return (<section className="py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{t('home.shopByCategory')}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (<CategoryCard key={category.id} category={category}/>))}
        </div>
      </div>
    </section>);
}
