import { Shirt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CategoryPageLayout from '../components/Category/CategoryPageLayout';
import { fashionProducts } from '../data/fashionProducts';

const fashionCategories = ['Cotton Apparel', 'Linen Wear', 'Handloom Sarees', 'Eco Bags', 'Handmade Jewelry'];
const fashionFeatures = ['Sustainable Fabric', 'Ethical Fashion', 'Handwoven', 'Natural Dyes', 'Slow Fashion'];
const discounts = ['20% off & Above', '40% off & Above', '60% off & Above'];

export default function FashionPage() {
    const { t } = useTranslation();
    return (
        <CategoryPageLayout
            apiCategory="fashion"
            title={t('categoryPages.fashion.title')}
            description={t('categoryPages.fashion.description')}
            tags={t('categoryPages.fashion.tags', { returnObjects: true })}
            heroGradient="from-rose-800 via-rose-600 to-red-400"
            icon={Shirt}
            badgeColorClass="bg-rose-600"
            products={fashionProducts}
            categories={fashionCategories}
            features={fashionFeatures}
            discounts={discounts}
        />
    );
}
