import { HeartPulse } from 'lucide-react';
import CategoryPageLayout from '../components/Category/CategoryPageLayout';
import { wellnessProducts } from '../data/wellnessProducts';
const wellnessCategories = ['Aromatherapy', 'Supplements & Teas', 'Yoga & Meditation', 'Skincare & Bath', 'Massage Tools'];
const wellnessFeatures = ['Organic', 'Cruelty-Free', 'Vegan', 'Therapeutic Grade', 'Ayurvedic'];
const discounts = ['10% off & Above', '25% off & Above', '50% off & Above'];
export default function WellnessPage() {
    return (<CategoryPageLayout title="Wellness Products" description="Nourish your mind, body, and soul with our curated collection of natural wellness products 🧘‍♀️" tags={['Self Care', 'Natural Healing', 'Mindfulness', 'Ayurvedic']} heroGradient="from-green-800 via-green-600 to-amber-500" icon={HeartPulse} badgeColorClass="bg-teal-600" products={wellnessProducts} categories={wellnessCategories} features={wellnessFeatures} discounts={discounts}/>);
}
