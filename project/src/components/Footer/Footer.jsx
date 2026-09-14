// // import { Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
// // import { Link } from 'react-router-dom';
// // import { useTranslation } from 'react-i18next';
// // import logoImg from '../../assets/products/Vsoft Logo black (1).png';
// // export default function Footer() {
// //     const { t } = useTranslation();
// //     return (<footer className="bg-gray-950 text-gray-300">
// //       <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
// //           {/* Column 1 - Brand */}
// //           <div className="md:col-span-2">
// //            <div className="bg-white rounded-xl  inline-block mb-4">
// //   <img src={logoImg} alt="Vedha Craft" className="h-16 w-auto object-contain hover:opacity-90 transition-opacity sm:h-24"/>
// // </div>
// //             <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-5">
// //               {t('footer.tagline')}
// //             </p>
// //             <div className="flex flex-col gap-2">
// //               <a href="tel:+919095422237" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors">
// //                 <Phone className="w-4 h-4 flex-shrink-0"/>
// //                 +91 9095422237
// //               </a>
// //               <a href="mailto:vedaconnecttvl@gmail.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors">
// //                 <Mail className="w-4 h-4 flex-shrink-0"/>
// //                 vedaconnecttvl@gmail.com
// //               </a>
// //             </div>
// //           </div>

// //           {/* Column 2 - Explore */}
// //           <div>
// //             <h3 className="text-amber-400 font-semibold text-base mb-4">{t('footer.explore')}</h3>
// //             <ul className="flex flex-col gap-3">
// //               {[
// //             { key: 'nav.eco', label: t('nav.eco'), to: '/eco' },
// //             { key: 'nav.wellness', label: t('nav.wellness'), to: '/wellness' },
// //             { key: 'nav.food', label: t('nav.food'), to: '/food' },
// //             { key: 'nav.craft', label: t('nav.craft'), to: '/craft' },
// //             { key: 'nav.fashion', label: t('nav.fashion'), to: '/fashion' },
// //             { key: 'nav.decor', label: t('nav.decor'), to: '/decor' },
// //         ].map((item) => (<li key={item.key}>
// //                   <Link to={item.to} className="text-sm text-gray-400 hover:text-white transition-colors">
// //                     {item.label}
// //                   </Link>
// //                 </li>))}
// //             </ul>
// //           </div>

// //           {/* Column 3 - Customer Policy */}
// //           <div>
// //             <h3 className="text-amber-400 font-semibold text-base mb-4">{t('footer.customerPolicy')}</h3>
// //             <ul className="flex flex-col gap-3">
// //               {[
// //             { key: 'footer.cancellationReturns', label: t('footer.cancellationReturns') },
// //             { key: 'footer.security', label: t('footer.security') },
// //             { key: 'footer.privacy', label: t('footer.privacy') },
// //             { key: 'footer.termsConditions', label: t('footer.termsConditions') },
// //         ].map((item) => (<li key={item.key}>
// //                   <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
// //                     {item.label}
// //                   </a>
// //                 </li>))}
// //             </ul>
// //           </div>

// //         <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
         
// //           <div className="flex items-center gap-4">
// //             <a href="https://www.instagram.com/vedacrafts_women_ecosellers?igsh=MWQwZ2hobTk4Z281Mw==" aria-label="Instagram" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200">
// //               <Instagram className="w-4 h-4"/>
// //             </a>
// //             <a href="https://www.facebook.com/profile.php?id=61589888365971&rdid=NomPOeMlAkGHZe8v&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ZVSsk4Ch5%2F#" aria-label="Facebook" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200">
// //               <Facebook className="w-4 h-4"/>
// //             </a>
            
// //           </div>
// //         </div>
          
// //         </div>

// //         {/* Bottom Bar */}
// //          <p className="text-xs text-gray-600">
// //             &copy; {new Date().getFullYear()} Vedha Craft. {t('footer.allRightsReserved')}
// //           </p>
// //       </div>
// //     </footer>);
// // }

// import { Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import logoImg from '../../assets/products/Vsoft Logo black (1).png';

// export default function Footer() {
//   const { t } = useTranslation();

//   return (
//     <footer className="bg-gray-950 text-gray-300">
//       <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
//           {/* Column 1 - Brand */}
//           <div className="md:col-span-2">
//             <div className="bg-white rounded-xl inline-block mb-4">
//               <img
//                 src={logoImg}
//                 alt="Vedha Craft"
//                 className="h-16 w-auto object-contain hover:opacity-90 transition-opacity sm:h-24"
//               />
//             </div>
//             <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-5">
//               {t('footer.tagline')}
//             </p>
//             <div className="flex flex-col gap-2">
//               <a
//                 href="tel:+919095422237"
//                 className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
//               >
//                 <Phone className="w-4 h-4 flex-shrink-0" />
//                 +91 9095422237
//               </a>
//               <a
//                 href="mailto:vedaconnecttvl@gmail.com"
//                 className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
//               >
//                 <Mail className="w-4 h-4 flex-shrink-0" />
//                 vedaconnecttvl@gmail.com
//               </a>
//             </div>
//           </div>

//           {/* Column 2 - Explore */}
//           <div>
//             <h3 className="text-amber-400 font-semibold text-base mb-4">{t('footer.explore')}</h3>
//             <ul className="flex flex-col gap-3">
//               {[
//                 { key: 'nav.eco', label: t('nav.eco'), to: '/eco' },
//                 { key: 'nav.wellness', label: t('nav.wellness'), to: '/wellness' },
//                 { key: 'nav.food', label: t('nav.food'), to: '/food' },
//                 { key: 'nav.craft', label: t('nav.craft'), to: '/craft' },
//                 { key: 'nav.fashion', label: t('nav.fashion'), to: '/fashion' },
//                 { key: 'nav.decor', label: t('nav.decor'), to: '/decor' },
//               ].map((item) => (
//                 <li key={item.key}>
//                   <Link to={item.to} className="text-sm text-gray-400 hover:text-white transition-colors">
//                     {item.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Column 3 - Customer Policy */}
//           <div>
//             <h3 className="text-amber-400 font-semibold text-base mb-4">{t('footer.customerPolicy')}</h3>
//             <ul className="flex flex-col gap-3">
//               {[
//                 {
//                   key: 'footer.cancellationReturns',
//                   label: t('footer.cancellationReturns'),
//                   to: '/legal-policies?policy=cancellation_refund',
//                 },
//                 {
//                   key: 'footer.shippingPolicy',
//                   label: t('footer.shippingPolicy', 'Shipping Policy'),
//                   to: '/legal-policies?policy=shipping_policy',
//                 },
//                 {
//                   key: 'footer.privacy',
//                   label: t('footer.privacy'),
//                   to: '/legal-policies?policy=privacy_policy',
//                 },
//                 {
//                   key: 'footer.termsConditions',
//                   label: t('footer.termsConditions'),
//                   to: '/legal-policies?policy=terms_conditions',
//                 },
//               ].map((item) => (
//                 <li key={item.key}>
//                   <Link to={item.to} className="text-sm text-gray-400 hover:text-white transition-colors">
//                     {item.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Column 4 - Connect With Us */}
//           <div>
//             <h3 className="text-amber-400 font-semibold text-base mb-4">
//               {t('footer.connectWithUs', 'Connect With Us')}
//             </h3>
//             <div className="flex items-center gap-4">
//               <a
//                 href="https://www.instagram.com/vedacrafts_women_ecosellers?igsh=MWQwZ2hobTk4Z281Mw=="
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 aria-label="Instagram"
//                 className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200"
//               >
//                 <Instagram className="w-4 h-4" />
//               </a>
//               <a
//                 href="https://www.facebook.com/profile.php?id=61589888365971&rdid=NomPOeMlAkGHZe8v&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ZVSsk4Ch5%2F#"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 aria-label="Facebook"
//                 className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200"
//               >
//                 <Facebook className="w-4 h-4" />
//               </a>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col items-center justify-center gap-4">
//           <a
//             href="https://www.instagram.com/vedacrafts_women_ecosellers?igsh=MWQwZ2hobTk4Z281Mw=="
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center gap-2 bg-amber-400 text-gray-950 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-amber-300 transition-colors duration-200"
//           >
//             {t('footer.joinCommunity', 'Join Our Community')}
//           </a>

//           <p className="text-xs text-gray-600 text-center">
//             &copy; {new Date().getFullYear()} Vedha Craft. {t('footer.allRightsReserved')}
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }

import { Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/products/Vsoft Logo black (1).png';
import { getCategories } from '../../services/categoryApi';

export default function Footer() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => console.error('Could not load footer categories from Supabase:', error));
  }, []);

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 items-start">
          {/* Column 1 - Brand */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl inline-block mb-4">
              <img
                src={logoImg}
                alt="Vedha Craft"
                className="h-16 w-auto object-contain hover:opacity-90 transition-opacity sm:h-24"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-5">
              {t('footer.tagline')}
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="tel:+919095422237"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                +91 9095422237
              </a>
              <a
                href="mailto:vedaconnecttvl@gmail.com"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                vedaconnecttvl@gmail.com
              </a>
            </div>
          </div>

          {/* Column 2 - Explore (2-col grid so it doesn't tower over the others) */}
          <div className="lg:col-span-3">
            <h3 className="text-amber-400 font-semibold text-base mb-4">{t('footer.explore')}</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link to={`/${category.slug}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Customer Policy */}
          <div className="lg:col-span-3">
            <h3 className="text-amber-400 font-semibold text-base mb-4">{t('footer.customerPolicy')}</h3>
            <ul className="flex flex-col gap-3">
              {[
                {
                  key: 'footer.cancellationReturns',
                  label: t('footer.cancellationReturns'),
                  to: '/legal-policies?policy=cancellation_refund',
                },
                {
                  key: 'footer.shippingPolicy',
                  label: t('footer.shippingPolicy', 'Shipping Policy'),
                  to: '/legal-policies?policy=shipping_policy',
                },
                {
                  key: 'footer.privacy',
                  label: t('footer.privacy'),
                  to: '/legal-policies?policy=privacy_policy',
                },
                {
                  key: 'footer.termsConditions',
                  label: t('footer.termsConditions'),
                  to: '/legal-policies?policy=terms_conditions',
                },
              ].map((item) => (
                <li key={item.key}>
                  <Link to={item.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Connect With Us */}
          <div className="lg:col-span-2">
            <h3 className="text-amber-400 font-semibold text-base mb-4">
              {t('footer.connectWithUs', 'Connect With Us')}
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/vedaconnect_women_network/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61589888365971&rdid=NomPOeMlAkGHZe8v&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ZVSsk4Ch5%2F#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col items-center justify-center gap-4">
          {/* Glass-effect Join Our Community button, amber family */}
          <a
            href="https://event.vedacraftscommunity.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-400/15 backdrop-blur-md
                       border border-amber-400/40 text-amber-300 text-sm font-semibold
                       px-6 py-2.5 rounded-full shadow-[0_0_20px_-4px_rgba(245,176,39,0.35)]
                       hover:bg-amber-400/25 hover:border-amber-400/60 hover:text-amber-200
                       transition-all duration-300"
          >
            {t('footer.joinCommunity', 'Join Our Community')}
          </a>

          <p className="text-xs text-gray-600 text-center">
            &copy; {new Date().getFullYear()} Vedha Craft. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
