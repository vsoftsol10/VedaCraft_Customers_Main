import { UtensilsCrossed } from 'lucide-react';
import CategoryPageLayout from '../components/Category/CategoryPageLayout';
import { foodProducts } from '../data/foodProducts';
const foodCategories = ['Grains', 'Spices', 'Honey', 'Oils', 'Nuts', 'Fresh Produce'];
const foodFeatures = ['Organic', 'Farm Fresh', 'No Preservatives', 'Locally Sourced', 'Vegan'];
const discounts = ['10% off & Above', '20% off & Above', '40% off & Above'];
export default function FoodPage() {
    return (<CategoryPageLayout title="Organic Food" description="Taste the purity of nature with our ethically sourced, organic food items 🍯" tags={['Farm Fresh', 'Healthy Living', 'Locally Sourced', 'Pesticide Free']} heroGradient="from-green-800 via-green-600 to-amber-500" icon={UtensilsCrossed} badgeColorClass="bg-orange-600" products={foodProducts} categories={foodCategories} features={foodFeatures} discounts={discounts}/>);
}
