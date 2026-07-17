import { Leaf } from 'lucide-react';
import CategoryPageLayout from '../components/Category/CategoryPageLayout';
import { ecoProducts } from '../data/ecoProducts';
const ecoCategories = ['Bamboo', 'Jute', 'Palm Leaf', 'Wood', 'Cotton', 'Coconut Shell'];
const ecoFeatures = ['Handmade', 'Reusable', 'Plastic-Free', 'Organic', 'Natural'];
const discounts = ['10% off & Above', '25% off & Above', '50% off & Above', '80% off & Above'];
export default function EcoPage() {
    return (<CategoryPageLayout title="Eco-Friendly Products" description="Handcrafted, sustainable products by rural artisans — good for you, great for the planet 🌿" tags={['Zero Waste', 'Biodegradable', 'Artisan Made', 'Planet Friendly']} heroGradient="from-green-800 via-green-600 to-amber-500" icon={Leaf} badgeColorClass="bg-green-600" products={ecoProducts} categories={ecoCategories} features={ecoFeatures} discounts={discounts}/>);
}
