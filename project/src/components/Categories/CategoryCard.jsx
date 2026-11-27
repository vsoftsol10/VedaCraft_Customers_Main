import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CategoryCard({ category }) {
    const { t } = useTranslation();
    const label = t(`category.${category.slug}`, category.name);

    return (
        <Link 
            to={`/${category.slug}`} 
            className="group flex flex-col items-center cursor-pointer w-full text-decoration-none select-none"
        >
            <div className="w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-[#FAF9F5] border border-stone-200/50 shadow-sm transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-md">
                {category.image ? (
                    <img 
                        src={category.image} 
                        alt={label} 
                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-700 font-semibold text-lg">
                        {label}
                    </div>
                )}
            </div>
            <span className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-semibold text-gray-900 group-hover:text-green-700 transition-colors text-center tracking-tight leading-snug">
                {label}
            </span>
        </Link>
    );
}


