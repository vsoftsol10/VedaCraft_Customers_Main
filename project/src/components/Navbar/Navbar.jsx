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

// import { NavLink } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';

// const navItems = [
//   { labelKey: 'nav.home', href: '/' },

//   { labelKey: 'nav.eco', href: '/eco' },
//   { labelKey: 'nav.wellness', href: '/wellness' },
//   { labelKey: 'nav.food', href: '/food' },
//   { labelKey: 'nav.craft', href: '/craft' },
//   { labelKey: 'nav.fashion', href: '/fashion' },
//   { labelKey: 'nav.decor', href: '/decor' },
//   { labelKey: 'nav.seller', href: '#' },
// ];

// export default function Navbar() {
//   const { t } = useTranslation();

//   return (
//     <nav className="bg-white border-b border-gray-200 shadow-sm">
//       <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
//         <ul className="flex items-center justify-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide">
//           {navItems.map((item) => (
//             <li key={item.labelKey} className="flex-shrink-0">
//               {item.href === '#' ? (
//                 <a
//                   href={item.href}
//                   className="block px-5 py-3 text-sm font-medium text-gray-700 hover:text-green-600 hover:border-b-2 hover:border-green-500 transition-all whitespace-nowrap"
//                 >
//                   {t(item.labelKey)}
//                 </a>
//               ) : (
//                 <NavLink
//                   to={item.href}
//                   end={item.href === '/'} // This makes the link end at the root
//                   className={({ isActive }) =>
//                     `block px-5 py-3 text-sm font-medium transition-all whitespace-nowrap ${
//                       isActive
//                         ? 'text-green-600 border-b-2 border-green-500'
//                         : 'text-gray-700 hover:text-green-600 hover:border-b-2 hover:border-green-500'
//                     }`
//                   }
//                 >
//                   {t(item.labelKey)}
//                 </NavLink>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </nav>
//   );
// }


// import { NavLink } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';

// const navItems = [
//   { labelKey: 'nav.home', href: '/' },
//   { labelKey: 'nav.eco', href: '/eco' },
//   { labelKey: 'nav.wellness', href: '/wellness' },
//   { labelKey: 'nav.food', href: '/food' },
//   { labelKey: 'nav.craft', href: '/craft' },
//   { labelKey: 'nav.fashion', href: '/fashion' },
//   { labelKey: 'nav.decor', href: '/decor' },
//   { labelKey: 'nav.seller', href: '#' },
// ];

// export default function Navbar() {
//   const { t } = useTranslation();

//   const linkClass = ({ isActive }) =>
//     `block px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 text-sm font-medium transition-all whitespace-nowrap ${
//       isActive
//         ? 'text-green-600 border-b-2 border-green-500'
//         : 'text-gray-700 hover:text-green-600 hover:border-b-2 hover:border-green-500'
//     }`;

//   return (
//     <nav className="bg-white border-b border-gray-200 shadow-sm relative z-40">
//       <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12">
//         {/* <ul className="flex items-center gap-1 sm:gap-4 lg:gap-8 overflow-x-auto scrollbar-hide"> */}
// <ul className="flex items-center gap-1 sm:gap-4 lg:gap-8 overflow-x-auto scrollbar-hide justify-start sm:justify-center">
//           {navItems.map((item) => (
//             <li key={item.labelKey} className="flex-shrink-0">
//               {item.href === '#' ? (
                
//                  <a href={item.href}
//                   className="block px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 text-sm font-medium text-gray-700 hover:text-green-600 hover:border-b-2 hover:border-green-500 transition-all whitespace-nowrap"
//                 >
//                   {t(item.labelKey)}
//                 </a>
//               ) : (
//                 <NavLink to={item.href} end={item.href === '/'} className={linkClass}>
//                   {t(item.labelKey)}
//                 </NavLink>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </nav>
//   );
// }

import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navItems = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.eco', href: '/eco' },
  { labelKey: 'nav.wellness', href: '/wellness' },
  { labelKey: 'nav.food', href: '/food' },
  { labelKey: 'nav.craft', href: '/craft' },
  { labelKey: 'nav.fashion', href: '/fashion' },
  { labelKey: 'nav.decor', href: '/decor' },
  { labelKey: 'nav.seller', href: '/seller' }, // was '#'
];

export default function Navbar() {
  const { t } = useTranslation();

  const linkClass = ({ isActive }) =>
    `block px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 text-sm font-medium transition-all whitespace-nowrap ${
      isActive
        ? 'text-green-600 border-b-2 border-green-500'
        : 'text-gray-700 hover:text-green-600 hover:border-b-2 hover:border-green-500'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm relative z-40">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12">
        <ul className="flex items-center gap-1 sm:gap-4 lg:gap-8 overflow-x-auto scrollbar-hide justify-start sm:justify-center">
          {navItems.map((item) => (
            <li key={item.labelKey} className="flex-shrink-0">
              <NavLink to={item.href} end={item.href === '/'} className={linkClass}>
                {t(item.labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}