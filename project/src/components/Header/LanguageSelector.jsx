import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी', short: 'HI' },
    { code: 'ta', label: 'தமிழ்', short: 'TA' },
    { code: 'te', label: 'తెలుగు', short: 'TE' },
    { code: 'kn', label: 'ಕನ್ನಡ', short: 'KN' },
    { code: 'ml', label: 'മലയാളം', short: 'ML' },
];
export default function LanguageSelector() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    // Default to 'en' if not set
    const currentLangCode = i18n.resolvedLanguage || i18n.language || 'en';
    const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };
    return (<div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors p-1 rounded-sm border border-transparent hover:border-gray-200">
        <Globe className="w-5 h-5"/>
        <span className="text-sm font-bold uppercase">{currentLang.short}</span>
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (<div className="absolute top-full mt-2 right-0 w-56 bg-white border border-gray-200 rounded-md shadow-xl z-50 overflow-hidden">
          {/* Decorative Arrow */}
          <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
          
          <div className="relative bg-white pt-3 pb-2">
            <div className="px-4 pb-2 mb-2 border-b border-gray-100 text-sm font-medium text-gray-700">
              {t('header.changeLanguage')}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {languages.map((lang) => (<li key={lang.code}>
                  <button onClick={() => changeLanguage(lang.code)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors group text-left">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${currentLang.code === lang.code ? 'border-[#f5b027]' : 'border-gray-300'}`}>
                      {currentLang.code === lang.code && (<div className="w-2 h-2 rounded-full bg-[#f5b027]"></div>)}
                    </div>
                    <span className={`text-sm ${currentLang.code === lang.code ? 'text-[#f5b027] font-medium' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {lang.label} - {lang.short}
                    </span>
                  </button>
                </li>))}
            </ul>
          </div>
        </div>)}
    </div>);
}
