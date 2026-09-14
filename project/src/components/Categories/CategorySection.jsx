import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CategoryCard from './CategoryCard';
import { getCategories } from '../../services/categoryApi';
export default function CategorySection() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      getCategories()
        .then(setCategories)
        .catch((error) => console.error('Could not load categories from Supabase:', error))
        .finally(() => setLoading(false));
    }, []);
    return (<section className="py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{t('home.shopByCategory')}</h2>
        {loading ? <div className="h-28 animate-pulse rounded-xl bg-gray-100" /> : categories.length > 0 ? <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (<CategoryCard key={category.id} category={category}/>))}
        </div> : <p className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500">No categories are available yet.</p>}
      </div>
    </section>);
}
