// import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// const navItems = [
//     { labelKey: 'nav.eco', href: '/eco' },
//     { labelKey: 'nav.wellness', href: '/wellness' },
//     { labelKey: 'nav.food', href: '/food' },
//     { labelKey: 'nav.craft', href: '/craft' },
//     { labelKey: 'nav.fashion', href: '/fashion' },
//     { labelKey: 'nav.decor', href: '/decor' },
//     { labelKey: 'nav.seller', href: '#' },
// ];
// export default function Navbar() {
//     const { t } = useTranslation();
//     return (<nav className="bg-white border-b border-gray-200 shadow-sm">
//       <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
//         <ul className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide">
//           {navItems.map((item) => (<li key={item.labelKey} className="flex-shrink-0">
//               <Link to={item.href} className="block px-5 py-3 text-sm font-medium text-gray-700 hover:text-green-600 hover:border-b-2 hover:border-green-500 transition-all whitespace-nowrap">
//                 {t(item.labelKey)}
//               </Link>
//             </li>))}
//         </ul>
//       </div>
//     </nav>);
// }

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navItems = [
  { labelKey: 'nav.eco', href: '/eco' },
  { labelKey: 'nav.wellness', href: '/wellness' },
  { labelKey: 'nav.food', href: '/food' },
  { labelKey: 'nav.craft', href: '/craft' },
  { labelKey: 'nav.fashion', href: '/fashion' },
  { labelKey: 'nav.decor', href: '/decor' },
  { labelKey: 'nav.seller', href: '#' },
];

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <ul className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <li key={item.labelKey} className="flex-shrink-0">
              {item.href === '#' ? (
                <a
                  href={item.href}
                  className="block px-5 py-3 text-sm font-medium text-gray-700 hover:text-green-600 hover:border-b-2 hover:border-green-500 transition-all whitespace-nowrap"
                >
                  {t(item.labelKey)}
                </a>
              ) : (
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `block px-5 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-green-600 border-b-2 border-green-500'
                        : 'text-gray-700 hover:text-green-600 hover:border-b-2 hover:border-green-500'
                    }`
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}