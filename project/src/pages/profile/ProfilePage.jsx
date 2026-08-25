// import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// import { User, ShoppingBag, Bell, MapPin, HelpCircle, LogOut, Leaf, Ruler } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { useTranslation } from 'react-i18next';
// const sidebarItems = [
//     { labelKey: 'profile.sidebar.myProfile', to: '/profile', icon: User },
//     { labelKey: 'profile.sidebar.myOrders', to: '/profile/orders', icon: ShoppingBag },
//     { labelKey: 'profile.sidebar.mySizeProfile', to: '/profile/size-profile', icon: Ruler },
//     { labelKey: 'profile.sidebar.myEcoImpact', to: '/profile/eco-impact', icon: Leaf },
//     { labelKey: 'profile.sidebar.notifications', to: '/profile/notifications', icon: Bell },
//     { labelKey: 'profile.sidebar.address', to: '/profile/address', icon: MapPin },
//     { labelKey: 'profile.sidebar.helpSupport', to: '/profile/help', icon: HelpCircle },
// ];
// export default function ProfilePage() {
//     const { t } = useTranslation();
//     const { logout } = useAuth();
//     const navigate = useNavigate();
//     const handleLogout = () => {
//         logout();
//         navigate('/');
//     };
//     return (<div className="min-h-screen bg-[#f5f0e8]">
//       <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
//         <div className="flex flex-col md:flex-row gap-6">
          
//           {/* Sidebar */}
//           <aside className="w-full md:w-56 flex-shrink-0">
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <nav className="flex flex-col py-2">
//                 {sidebarItems.map(({ labelKey, to, icon: Icon }) => (<NavLink key={to} to={to} end={to === '/profile'} className={({ isActive }) => `flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors
//                        ${isActive
//                 ? 'bg-[#f0f5ec] text-[#2d6a2d] border-l-4 border-[#2d6a2d]'
//                 : 'text-gray-600 hover:bg-gray-50 hover:text-[#2d6a2d] border-l-4 border-transparent'}`}>
//                     <Icon className="w-4 h-4 flex-shrink-0"/>
//                     <span>{t(labelKey)}</span>
//                   </NavLink>))}

//                 {/* Divider */}
//                 <div className="my-1 border-t border-gray-100"/>

//                 {/* Logout */}
//                 <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-gray-600
//                              hover:bg-red-50 hover:text-red-600 border-l-4 border-transparent
//                              hover:border-red-400 transition-colors w-full text-left">
//                   <LogOut className="w-4 h-4 flex-shrink-0"/>
//                   <span>{t('profile.sidebar.logout')}</span>
//                 </button>
//               </nav>
//             </div>
//           </aside>

//           {/* Main Content */}
//           <main className="flex-1 min-w-0">
//             <Outlet />
//           </main>

//         </div>
//       </div>
//     </div>);
// }

import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Bell, MapPin, HelpCircle, LogOut, Leaf, Ruler, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const sidebarItems = [
    { labelKey: 'profile.sidebar.myProfile', to: '/profile', icon: User },
    { labelKey: 'profile.sidebar.myOrders', to: '/profile/orders', icon: ShoppingBag },
    { labelKey: 'profile.sidebar.mySizeProfile', to: '/profile/size-profile', icon: Ruler },
    { labelKey: 'profile.sidebar.myEcoImpact', to: '/profile/eco-impact', icon: Leaf },
    { labelKey: 'profile.sidebar.notifications', to: '/profile/notifications', icon: Bell },
    { labelKey: 'profile.sidebar.address', to: '/profile/address', icon: MapPin },
    { labelKey: 'profile.sidebar.helpSupport', to: '/profile/help', icon: HelpCircle },
];

export default function ProfilePage() {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="min-h-screen bg-[#f5f0e8]">

            {/* Mobile top bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
                <h1 className="text-base font-semibold text-gray-800">{t('profile.sidebar.myProfile')}</h1>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-[#2d6a2d] transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile backdrop overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row gap-6">

                    {/* Sidebar */}
                    <aside
                        className={`
                            fixed md:static top-0 left-0 h-full md:h-auto w-64 md:w-56 flex-shrink-0 z-50
                            transform transition-transform duration-300 ease-in-out
                            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                            md:translate-x-0
                        `}
                    >
                        <div className="bg-white md:rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full md:h-auto">

                            {/* Close button, mobile only */}
                            <div className="flex md:hidden items-center justify-between px-5 py-3.5 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-800">Menu</span>
                                <button
                                    onClick={closeSidebar}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <nav className="flex flex-col py-2">
                                {sidebarItems.map(({ labelKey, to, icon: Icon }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={to === '/profile'}
                                        onClick={closeSidebar}
                                        className={({ isActive }) => `flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors
                                           ${isActive
                                                ? 'bg-[#f0f5ec] text-[#2d6a2d] border-l-4 border-[#2d6a2d]'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-[#2d6a2d] border-l-4 border-transparent'}`}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        <span>{t(labelKey)}</span>
                                    </NavLink>
                                ))}

                                {/* Divider */}
                                <div className="my-1 border-t border-gray-100" />

                                {/* Logout */}
                                <button
                                    onClick={() => { closeSidebar(); handleLogout(); }}
                                    className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-gray-600
                                             hover:bg-red-50 hover:text-red-600 border-l-4 border-transparent
                                             hover:border-red-400 transition-colors w-full text-left"
                                >
                                    <LogOut className="w-4 h-4 flex-shrink-0" />
                                    <span>{t('profile.sidebar.logout')}</span>
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <Outlet />
                    </main>

                </div>
            </div>
        </div>
    );
}