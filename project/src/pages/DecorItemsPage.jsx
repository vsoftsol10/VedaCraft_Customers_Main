import { Lamp } from 'lucide-react';
import CategoryPageLayout from '../components/Category/CategoryPageLayout';
import { decorProducts } from '../data/decorProducts';
const decorCategories = ['Wall Art', 'Lighting', 'Rugs & Carpets', 'Vases & Planters', 'Table Accents'];
const decorFeatures = ['Handmade', 'Upcycled', 'Rustic', 'Minimalist', 'Bohemian'];
const discounts = ['10% off & Above', '30% off & Above', '50% off & Above'];
export default function DecorItemsPage() {
    return (<CategoryPageLayout title="Home Decor Items" description="Transform your space with beautiful, handcrafted decor that tells a story 🖼️" tags={['Handmade Decor', 'Upcycled Art', 'Rustic Charm', 'Interior Styling']} heroGradient="from-amber-900 via-amber-700 to-yellow-600" icon={Lamp} badgeColorClass="bg-amber-700" products={decorProducts} categories={decorCategories} features={decorFeatures} discounts={discounts}/>);
}
