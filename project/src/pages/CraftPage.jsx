import { Scissors } from 'lucide-react';
import CategoryPageLayout from '../components/Category/CategoryPageLayout';
import { craftProducts } from '../data/craftProducts';
const craftCategories = ['Pottery', 'Weaving', 'Woodwork', 'Paper Crafts', 'Metal Art'];
const craftFeatures = ['Handcrafted', 'Traditional', 'Unique', 'Locally Made', 'Customizable'];
const discounts = ['10% off & Above', '15% off & Above', '25% off & Above'];
export default function CraftPage() {
    return (<CategoryPageLayout title="Artisan Crafts" description="Discover unique masterpieces handcrafted by skilled artisans preserving ancient traditions 🏺" tags={['Handcrafted', 'Traditional Art', 'Support Artisans', 'Cultural Heritage']} heroGradient="from-green-800 via-green-600 to-amber-500" icon={Scissors} badgeColorClass="bg-purple-600" products={craftProducts} categories={craftCategories} features={craftFeatures} discounts={discounts}/>);
}
