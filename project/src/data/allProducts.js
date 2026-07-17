import { ecoProducts } from './ecoProducts';
import { wellnessProducts } from './wellnessProducts';
import { foodProducts } from './foodProducts';
import { craftProducts } from './craftProducts';
import { fashionProducts } from './fashionProducts';
import { decorProducts } from './decorProducts';
export const allProducts = [
    ...ecoProducts.map(p => ({ ...p, mainCategory: 'Eco' })),
    ...wellnessProducts.map(p => ({ ...p, mainCategory: 'Wellness' })),
    ...foodProducts.map(p => ({ ...p, mainCategory: 'Food' })),
    ...craftProducts.map(p => ({ ...p, mainCategory: 'Craft' })),
    ...fashionProducts.map(p => ({ ...p, mainCategory: 'Fashion' })),
    ...decorProducts.map(p => ({ ...p, mainCategory: 'Decor Items' })),
];
