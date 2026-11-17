import { UtensilsCrossed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CategoryPageLayout from '../components/Category/CategoryPageLayout';
import { foodProducts } from '../data/foodProducts';

const foodCategories = ['Grains', 'Spices', 'Honey', 'Oils', 'Nuts', 'Fresh Produce'];
const foodFeatures = ['Organic', 'Farm Fresh', 'No Preservatives', 'Locally Sourced', 'Vegan'];
const discounts = ['10% off & Above', '20% off & Above', '40% off & Above'];

export default function FoodPage() {
    const { t } = useTranslation();
    return (
        <CategoryPageLayout
            apiCategory="food"
            title={t('categoryPages.food.title')}
            description={t('categoryPages.food.description')}
            tags={t('categoryPages.food.tags', { returnObjects: true })}
            heroGradient="from-green-800 via-green-600 to-amber-500"
            icon={UtensilsCrossed}
            badgeColorClass="bg-orange-600"
            products={foodProducts}
            categories={foodCategories}
            features={foodFeatures}
            discounts={discounts}
        />
    );
}
