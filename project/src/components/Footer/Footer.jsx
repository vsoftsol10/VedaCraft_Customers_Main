import { Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/products/WhatsApp_Image_2026-06-19_at_11.31.57_AM.jpeg';
export default function Footer() {
    const { t } = useTranslation();
    return (<footer className="bg-gray-950 text-gray-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1 - Brand */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl p-3 inline-block mb-4">
              <img src={logoImg} alt="Vedha Craft" className="h-14 w-auto object-contain"/>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-5">
              {t('footer.tagline')}
            </p>
            <div className="flex flex-col gap-2">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0"/>
                +91 98765 43210
              </a>
              <a href="mailto:hello@vedacraft.in" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0"/>
                hello@vedacraft.in
              </a>
            </div>
          </div>

          {/* Column 2 - Explore */}
          <div>
            <h3 className="text-amber-400 font-semibold text-base mb-4">{t('footer.explore')}</h3>
            <ul className="flex flex-col gap-3">
              {[
            { key: 'nav.eco', label: t('nav.eco'), to: '/eco' },
            { key: 'nav.wellness', label: t('nav.wellness'), to: '/wellness' },
            { key: 'nav.food', label: t('nav.food'), to: '/food' },
            { key: 'nav.craft', label: t('nav.craft'), to: '/craft' },
            { key: 'nav.fashion', label: t('nav.fashion'), to: '/fashion' },
            { key: 'nav.decor', label: t('nav.decor'), to: '/decor' },
        ].map((item) => (<li key={item.key}>
                  <Link to={item.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>))}
            </ul>
          </div>

          {/* Column 3 - Customer Policy */}
          <div>
            <h3 className="text-amber-400 font-semibold text-base mb-4">{t('footer.customerPolicy')}</h3>
            <ul className="flex flex-col gap-3">
              {[
            { key: 'footer.cancellationReturns', label: t('footer.cancellationReturns') },
            { key: 'footer.security', label: t('footer.security') },
            { key: 'footer.privacy', label: t('footer.privacy') },
            { key: 'footer.termsConditions', label: t('footer.termsConditions') },
        ].map((item) => (<li key={item.key}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>))}
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h3 className="text-amber-400 font-semibold text-base mb-4">{t('footer.contact')}</h3>
            <ul className="flex flex-col gap-3">
              {[
            { key: 'footer.contact', label: t('footer.contact') },
            { key: 'footer.community', label: t('footer.community') },
        ].map((item) => (<li key={item.key}>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </a>
                </li>))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Vedha Craft. {t('footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200">
              <Instagram className="w-4 h-4"/>
            </a>
            <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200">
              <Facebook className="w-4 h-4"/>
            </a>
            <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200">
              <Youtube className="w-4 h-4"/>
            </a>
          </div>
        </div>
      </div>
    </footer>);
}
