import { HeartPulse } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CategoryPageLayout from '../components/Category/CategoryPageLayout';
import { wellnessProducts } from '../data/wellnessProducts';

const wellnessCategories = ['Aromatherapy', 'Supplements & Teas', 'Yoga & Meditation', 'Skincare & Bath', 'Massage Tools'];
const wellnessFeatures = ['Organic', 'Cruelty-Free', 'Vegan', 'Therapeutic Grade', 'Ayurvedic'];
const discounts = ['10% off & Above', '25% off & Above', '50% off & Above'];

export default function WellnessPage() {
    const { t } = useTranslation();
    return (
        <CategoryPageLayout
            apiCategory="wellness"
            title={t('categoryPages.wellness.title')}
            description={t('categoryPages.wellness.description')}
            tags={t('categoryPages.wellness.tags', { returnObjects: true })}
            heroGradient="from-green-800 via-green-600 to-amber-500"
            icon={HeartPulse}
            badgeColorClass="bg-teal-600"
            products={wellnessProducts}
            categories={wellnessCategories}
            features={wellnessFeatures}
            discounts={discounts}
        />
    );
}
