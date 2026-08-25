// import { User, ShoppingCart, Heart } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import logoImg from '../../assets/products/Vsoft Logo black cropped.png';
// import LocationSelector from './LocationSelector';
// import SearchBar from './SearchBar';
// import { useCart } from '../../context/CartContext';
// import { useWishlist } from '../../context/WishlistContext';
// import LanguageSelector from './LanguageSelector';
// import { useAuth } from '../../context/AuthContext';
// export default function Header() {
//     const { t } = useTranslation();
//     const { items, toggleCart } = useCart();
//     const { items: wishlistItems } = useWishlist();
//     const { user, logout } = useAuth();
//     const wishlistCount = wishlistItems.length;
//     const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
//     return (<header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
//       <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 py-2">
//         <div className="flex flex-wrap items-center justify-between gap-3 md:flex-nowrap md:gap-8 w-full">
//           {/* Left: Logo & Location */}
//           <div className="flex min-w-0 items-center gap-3 md:gap-8 flex-shrink-0">
//             {/* Logo */}
//            <Link to="/" className="flex h-14 w-36 flex-shrink-0 items-center sm:h-24 sm:w-60">
//   <img src={logoImg} alt="Vedha Craft" className="h-12 w-auto object-contain hover:opacity-90 transition-opacity sm:h-[4.5rem]"/>
// </Link>
//             {/* Location Selector */}
//             <div className="hidden md:flex flex-shrink-0">
//               <LocationSelector />
//             </div>
//           </div>

//           {/* Search Bar */}
//           <SearchBar />

//           {/* Language + Icons */}
//           <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
//             {/* Language Selector */}
//             <LanguageSelector />

//             {/* Profile */}
//             {!user ? (<Link to="/login" className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
//                 <div className="relative flex items-center justify-center transition-colors">
//                   <User className="w-5 h-5"/>
//                 </div>
//                 <span className="text-[10px] font-medium hidden sm:block">{t('header.profile')}</span>
//               </Link>) : (<div className="relative group">
//                 <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
//                   <div className="relative flex items-center justify-center transition-colors">
//                     <User className="w-5 h-5 text-green-600"/>
//                   </div>
//                   <span className="text-[10px] font-medium hidden sm:block text-green-600">{t('header.profile')}</span>
//                 </Link>
//                 {/* Dropdown */}
//                 <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                   <div className="px-3 py-2 border-b border-gray-100">
//                     <p className="text-xs text-gray-500">{t('header.signedInAs')}</p>
//                     <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
//                   </div>
//                   <div className="p-2 space-y-1">
//                     <Link to="/profile" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg">{t('header.myProfile')}</Link>
//                     <Link to="/profile/orders" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg">{t('header.orders')}</Link>
//                     <Link to="/wishlist" className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg">{t('header.wishlist')}</Link>
//                     <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">{t('header.logout')}</button>
//                   </div>
//                 </div>
//               </div>)}

//             {/* Cart */}
//             <button onClick={() => toggleCart(true)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
//               <div className="relative flex items-center justify-center transition-colors">
//                 <ShoppingCart className="w-5 h-5"/>
//                 {cartCount > 0 && (<span className="absolute -top-1.5 -right-2 bg-green-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
//                     {cartCount}
//                   </span>)}
//               </div>
//               <span className="text-[10px] font-medium hidden sm:block">{t('header.cart')}</span>
//             </button>

//             {/* Wishlist */}
//             <Link to="/wishlist" className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
//               <div className="relative flex items-center justify-center transition-colors">
//                 <Heart className="w-5 h-5"/>
//                 {wishlistCount > 0 && (<span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
//                     {wishlistCount}
//                   </span>)}
//               </div>
//               <span className="text-[10px] font-medium hidden sm:block">{t('header.wishlist')}</span>
//             </Link>
//           </div>

//         </div>
//       </div>
//     </header>);
// }


// import { useState, useRef, useEffect } from 'react';
// // import { User, ShoppingCart, Heart } from 'lucide-react';
// import { User, ShoppingCart, Heart, Bell } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import logoImg from '../../assets/products/Vsoft Logo black cropped.png';
// import LocationSelector from './LocationSelector';
// import SearchBar from './SearchBar';
// import { useCart } from '../../context/CartContext';
// import { useWishlist } from '../../context/WishlistContext';
// import LanguageSelector from './LanguageSelector';
// import { useAuth } from '../../context/AuthContext';

// export default function Header() {
//   const { t } = useTranslation();
//   const { items, toggleCart } = useCart();
//   const { items: wishlistItems } = useWishlist();
//   const { user, logout } = useAuth();

//   const wishlistCount = wishlistItems.length;
//   const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

//   const [profileOpen, setProfileOpen] = useState(false);
//   const profileRef = useRef(null);

//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (profileRef.current && !profileRef.current.contains(e.target)) {
//         setProfileOpen(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
//       <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 py-2">
//         {/* <div className="flex flex-wrap items-center justify-between gap-3 md:flex-nowrap md:gap-6 w-full"> */}
//         <div className="flex flex-wrap items-center justify-between gap-3 md:flex-nowrap md:gap-4 w-full">
//           {/* Left: Logo & Location — kept close together as one tight unit */}
//         <div className="flex min-w-0 items-center gap-4 sm:gap-5 md:gap-6 flex-shrink-0 md:mr-4 lg:mr-8">
//   {/* Logo */}
//   <Link
//     to="/"
//     className="flex h-16 w-40 flex-shrink-0 items-center sm:h-24 sm:w-48 lg:w-52"
//   >
//     <img
//       src={logoImg}
//       alt="Vedha Craft"
//       className="h-14 w-auto object-contain hover:opacity-90 transition-opacity sm:h-[4.5rem]"
//     />
//   </Link>

//   {/* Location Selector */}
//   <div className="flex w-[130px] flex-shrink-0 items-center overflow-hidden sm:w-[160px] md:w-[180px]">
//     <LocationSelector />
//   </div>
// </div>

       
//           {/* Search Bar - wide, shorter height, slightly tighter border radius */}
// <div className="order-3 basis-full md:order-none md:basis-auto flex-1 min-w-0 md:min-w-[400px] lg:min-w-[560px] [&_input]:h-7 [&_input]:text-sm [&_input]:rounded-lg [&_div]:rounded-lg">
//   <SearchBar />
// </div>

//           {/* Language + Icons */}
//           <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
//             <div className="hidden md:flex">
//               <LanguageSelector />
//             </div>

//             {/* Profile */}
//             {!user ? (
//              <Link
//   to="/"
//   className="flex h-15 w-38 flex-shrink-0 items-center sm:h-24 sm:w-52 lg:w-56"
// >
//   <img
//     src={logoImg}
//     alt="Vedha Craft"
//     className="h-11 w-auto object-contain hover:opacity-90 transition-opacity sm:h-20"
//   />
// </Link>
//             ) : (
//               <div className="relative" ref={profileRef}>
//                 <button
//                   onClick={() => setProfileOpen((v) => !v)}
//                   className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
//                   aria-expanded={profileOpen}
//                   aria-label={t('header.profile')}
//                 >
//                   <div className="relative flex items-center justify-center transition-colors">
//                     <User className="w-5 h-5 text-green-600" />
//                   </div>
//                   <span className="text-[10px] font-medium hidden sm:block text-green-600">
//                     {t('header.profile')}
//                   </span>
//                 </button>

//                 {profileOpen && (
//                   <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-lg z-50">
//                     <div className="px-3 py-2 border-b border-gray-100">
//                       <p className="text-xs text-gray-500">{t('header.signedInAs')}</p>
//                       <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
//                     </div>
//                     <div className="p-2 space-y-1">
//                       <Link
//                         to="/profile"
//                         onClick={() => setProfileOpen(false)}
//                         className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md"
//                       >
//                         {t('header.myProfile')}
//                       </Link>
//                       <Link
//                         to="/profile/orders"
//                         onClick={() => setProfileOpen(false)}
//                         className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md"
//                       >
//                         {t('header.orders')}
//                       </Link>
                 
//                       <button
//                         onClick={() => {
//                           setProfileOpen(false);
//                           logout();
//                         }}
//                         className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
//                       >
//                         {t('header.logout')}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Cart */}
//             <button
//               onClick={() => toggleCart(true)}
//               className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
//             >
//               <div className="relative flex items-center justify-center transition-colors">
//                 <ShoppingCart className="w-5 h-5" />
//                 {cartCount > 0 && (
//                   <span className="absolute -top-1.5 -right-2 bg-green-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
//                     {cartCount}
//                   </span>
//                 )}
//               </div>
//               <span className="text-[10px] font-medium hidden sm:block">{t('header.cart')}</span>
//             </button>

//             {/* Wishlist */}
//             <Link
//               to="/wishlist"
//               className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
//             >
//               <div className="relative flex items-center justify-center transition-colors">
//                 <Heart className="w-5 h-5" />
//                 {wishlistCount > 0 && (
//                   <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
//                     {wishlistCount}
//                   </span>
//                 )}
//               </div>
//               <span className="text-[10px] font-medium hidden sm:block">{t('header.wishlist')}</span>
//             </Link>
//             {/*  */}
//              <Link
//               to="/profile/notifications"
//               className="flex flex-col items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
//               aria-label={t('profile.sidebar.notifications')}
//             >
//               <Bell className="w-5 h-5" />
//               <span className="text-[10px] font-medium hidden sm:block">
//                 {t('profile.sidebar.notifications')}
//               </span>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

import { useState, useRef, useEffect } from 'react';
import { User, ShoppingCart, Heart, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/products/Vsoft Logo black cropped.png';
import LocationSelector from './LocationSelector';
import SearchBar from './SearchBar';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
export default function Header() {
  const { t } = useTranslation();
  const { items, isOpen: cartOpen, toggleCart } = useCart();
 
  const { user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { unreadCount } = useNotifications();
  const wishlistCount = wishlistItems.length;
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-y-2 md:flex-nowrap md:gap-4 w-full">

          {/* Left: Logo & Location */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4 flex-shrink-0 md:mr-4 lg:mr-6">
            {/* Logo */}
            <Link
              to="/"
              className="flex h-9 w-24 flex-shrink-0 items-center sm:h-12 sm:w-32 md:h-14 md:w-36 lg:h-16 lg:w-44"
            >
              <img
                src={logoImg}
                alt="Vedha Craft"
                className="h-full w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </Link>

            {/* Location Selector — desktop/tablet only */}
            <div className="hidden md:flex w-[150px] lg:w-[180px] flex-shrink-0 items-center overflow-hidden">
              <LocationSelector />
            </div>
          </div>

          {/* Icons — sit on the same row as the logo on mobile, far right on desktop */}
          <div className="order-2 md:order-3 flex items-center gap-3 sm:gap-4 md:gap-5 flex-shrink-0">
            {/* Language Selector — desktop/tablet only */}
            <div className="hidden md:flex">
              <LanguageSelector />
            </div>

            {/* Profile / Login */}
            {!user ? (
              <Link
                to="/login"
                className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-green-600 transition-colors"
              >
                <User className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                <span className="text-[10px] font-medium hidden md:block">
                  {t('header.profile')}
                </span>
              </Link>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex flex-col items-center gap-0.5 text-green-600 transition-colors"
                  aria-expanded={profileOpen}
                  aria-label={t('header.profile')}
                >
                  <User className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                  <span className="text-[10px] font-medium hidden md:block">
                    {t('header.profile')}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 max-w-[85vw] bg-white border border-gray-100 shadow-xl rounded-lg z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">{t('header.signedInAs')}</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md"
                      >
                        {t('header.myProfile')}
                      </Link>
                      <Link
                        to="/profile/orders"
                        onClick={() => setProfileOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md"
                      >
                        {t('header.orders')}
                      </Link>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                      >
                        {t('header.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <button
              onClick={() => toggleCart(true)}
              className={`flex w-10 flex-col items-center gap-0.5 transition-colors md:w-12 ${
                cartOpen ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[9px] font-bold leading-none text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium hidden md:block">{t('header.cart')}</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-green-600 transition-colors"
            >
              <div className="relative flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium hidden md:block">{t('header.wishlist')}</span>
            </Link>

            {/* Notifications */}
                       {/* Notifications */}
            <Link
              to="/profile/notifications"
              className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-green-600 transition-colors"
              aria-label={t('profile.sidebar.notifications')}
            >
              <div className="relative flex items-center justify-center">
                <Bell className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium hidden md:block">
                {t('profile.sidebar.notifications')}
              </span>
            </Link>
          </div>

          {/* Search Bar — own full-width row on mobile/tablet, inline on desktop */}
          <div className="order-3 md:order-2 basis-full md:basis-auto flex-1 min-w-0 md:min-w-[280px] lg:min-w-[480px] [&_input]:h-9 md:[&_input]:h-8 [&_input]:text-sm [&_input]:rounded-lg [&_div]:rounded-lg">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  );
}
