import { Shirt } from 'lucide-react';
import CategoryPageLayout from '../components/Category/CategoryPageLayout';
import { fashionProducts } from '../data/fashionProducts';
const fashionCategories = ['Cotton Apparel', 'Linen Wear', 'Handloom Sarees', 'Eco Bags', 'Handmade Jewelry'];
const fashionFeatures = ['Sustainable Fabric', 'Ethical Fashion', 'Handwoven', 'Natural Dyes', 'Slow Fashion'];
const discounts = ['20% off & Above', '40% off & Above', '60% off & Above'];
export default function FashionPage() {
    return (<CategoryPageLayout title="Sustainable Fashion" description="Express yourself with eco-friendly clothing and accessories that look good and do good 👗" tags={['Slow Fashion', 'Handloom', 'Natural Dyes', 'Ethical Wear']} heroGradient="from-rose-800 via-rose-600 to-red-400" icon={Shirt} badgeColorClass="bg-rose-600" products={fashionProducts} categories={fashionCategories} features={fashionFeatures} discounts={discounts}/>);
}
