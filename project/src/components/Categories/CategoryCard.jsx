import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export default function CategoryCard({ category }) {
    const { t } = useTranslation();
    const label = t(`category.${category.slug}`, category.name);
    return (<Link to={`/${category.slug}`} className="flex flex-col items-center gap-3 group cursor-pointer">
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-green-400 transition-all duration-200 shadow-sm group-hover:shadow-md group-hover:scale-105">
        <img src={category.image} alt={label} className="w-full h-full object-cover"/>
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors text-center">
        {label}
      </span>
    </Link>);
}
