import { Search, Mic, Loader2, AlertCircle, Clock, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { allProducts } from '../../data/allProducts';
import { fetchRecentSearches, saveRecentSearch, deleteRecentSearch, clearRecentSearches, } from '../../services/recentSearchApi';
import { useAuth } from '../../context/AuthContext';
// Helper to get description keywords for searching product descriptions
const getProductDescriptionKeywords = (p) => {
    if (p.mainCategory.toLowerCase() === 'eco') {
        return 'eco-friendly sustainable biodegradable plastic-free natural materials organic zero waste';
    }
    if (p.mainCategory.toLowerCase() === 'wellness') {
        return 'wellness healthy organic ingredients therapeutic natural healing relaxation self care';
    }
    if (p.mainCategory.toLowerCase() === 'food') {
        return 'organic food hand-processed traditional recipe healthy grains pure ingredients nutritional';
    }
    if (p.mainCategory.toLowerCase() === 'craft') {
        return 'handcrafted rural artisans traditional art heritage home decor eco-friendly crafts';
    }
    if (p.mainCategory.toLowerCase() === 'fashion') {
        return 'natural fiber organic cotton hand-spun handloom fabric sustainable fashion breathable';
    }
    if (p.mainCategory.toLowerCase() === 'decor items' || p.mainCategory.toLowerCase() === 'decor') {
        return 'handcrafted home decor wall hanging candle holder elegant aesthetic artistic ornaments';
    }
    return '';
};
// Map website language to SpeechRecognition locale
const speechLocales = {
    en: 'en-IN',
    ta: 'ta-IN',
    hi: 'hi-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
};
export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [voiceState, setVoiceState] = useState('idle');
    const [voiceError, setVoiceError] = useState(null);
    // In-memory only — no localStorage. For logged-in users, synced with backend.
    const [recentSearches, setRecentSearches] = useState([]);
    const dropdownRef = useRef(null);
    const recognitionRef = useRef(null);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Clean up SpeechRecognition on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);
    const loadRecentSearches = async () => {
        if (!user) {
            setRecentSearches([]);
            return;
        }
        const data = await fetchRecentSearches();
        setRecentSearches(data);
    };
    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setIsDropdownOpen(true);
    };
    const handleFocus = () => {
        loadRecentSearches();
        setIsDropdownOpen(true);
    };
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        setQuery('');
        setIsDropdownOpen(false);
    };
    const persistRecentSearch = (term) => {
        if (!user)
            return;
        saveRecentSearch(term).catch((error) => {
            console.error('Failed to save recent search', error);
        });
    };
    const handleRecentClick = (term) => {
        setIsDropdownOpen(false);
        persistRecentSearch(term);
        navigate(`/search?q=${encodeURIComponent(term)}`);
    };
    const handleRemoveRecent = async (e, term) => {
        e.stopPropagation();
        if (user) {
            await deleteRecentSearch(term);
            await loadRecentSearches();
        }
    };
    const handleClearAll = async (e) => {
        e.stopPropagation();
        if (user) {
            await clearRecentSearches();
        }
        setRecentSearches([]);
    };
    const submitSearch = (term) => {
        setIsDropdownOpen(false);
        persistRecentSearch(term);
        navigate(`/search?q=${encodeURIComponent(term)}`);
    };
    // Perform search matching
    const filteredProducts = query.trim() === ''
        ? []
        : allProducts.filter(p => {
            const lowerQuery = query.toLowerCase();
            const descKeywords = getProductDescriptionKeywords(p);
            return (p.name.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery) ||
                p.mainCategory.toLowerCase().includes(lowerQuery) ||
                descKeywords.toLowerCase().includes(lowerQuery));
        });
    // Start Voice Speech Recognition
    const toggleVoiceSearch = () => {
        if (voiceState === 'listening') {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setVoiceState('idle');
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceError(t('voiceSearch.errUnsupported'));
            setVoiceState('error');
            setTimeout(() => {
                setVoiceState('idle');
                setVoiceError(null);
            }, 4000);
            return;
        }
        try {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.continuous = false;
            recognition.interimResults = false;
            const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
            recognition.lang = speechLocales[currentLang] || 'en-IN';
            recognition.onstart = () => {
                setVoiceState('listening');
                setVoiceError(null);
            };
            recognition.onresult = (event) => {
                setVoiceState('processing');
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    setQuery(transcript);
                    setIsDropdownOpen(true);
                    setVoiceState('idle');
                }
            };
            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                let errorMsg = t('voiceSearch.errNoSpeech');
                if (event.error === 'not-allowed') {
                    errorMsg = t('voiceSearch.errPermission');
                }
                else if (event.error === 'no-speech') {
                    errorMsg = t('voiceSearch.errNoSpeech');
                }
                else if (event.error === 'service-not-allowed' || event.error === 'network') {
                    errorMsg = t('voiceSearch.errMicUnavailable');
                }
                setVoiceError(errorMsg);
                setVoiceState('error');
                setTimeout(() => {
                    setVoiceState('idle');
                    setVoiceError(null);
                }, 4000);
            };
            recognition.onend = () => {
                setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
            };
            recognition.start();
        }
        catch (e) {
            console.error(e);
            setVoiceError(t('voiceSearch.errMicUnavailable'));
            setVoiceState('error');
            setTimeout(() => {
                setVoiceState('idle');
                setVoiceError(null);
            }, 4000);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim() !== '') {
            submitSearch(query.trim());
        }
    };
    const showRecentSearches = isDropdownOpen && query.trim() === '' && user && recentSearches.length > 0;
    const showProductResults = isDropdownOpen && query.trim() !== '';
    return (<div className="flex-1 max-w-2xl relative" ref={dropdownRef}>
      <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:border-green-400 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0 mr-2"/>
        <input type="text" value={query} onChange={handleInputChange} onKeyDown={handleKeyDown} onFocus={handleFocus} placeholder={t('search.placeholder')} className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"/>

        {/* Voice Search Microphone Button */}
        <button onClick={toggleVoiceSearch} className={`relative flex-shrink-0 ml-2 p-1.5 rounded-full transition-all duration-300 ${voiceState === 'listening'
            ? 'bg-red-50 text-red-600 scale-110 shadow-md ring-4 ring-red-100'
            : voiceState === 'processing'
                ? 'bg-yellow-50 text-yellow-600'
                : 'text-gray-400 hover:text-green-600 hover:bg-gray-50'}`} title="Voice Search">
          {voiceState === 'processing' ? (<Loader2 className="w-4 h-4 animate-spin"/>) : (<Mic className="w-4 h-4"/>)}
          {voiceState === 'listening' && (<span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75"></span>)}
        </button>
      </div>

      {/* Floating Status & Error Banner */}
      {(voiceState === 'listening' || voiceState === 'processing' || voiceState === 'error') && (<div className={`absolute top-full mt-2 w-full px-4 py-3 rounded-lg shadow-lg border text-sm z-50 flex items-center gap-2 transition-all ${voiceState === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-800'}`}>
          {voiceState === 'listening' && (<>
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse flex-shrink-0"/>
              <span className="font-semibold">{t('voiceSearch.listening')}</span>
              <span className="text-xs text-green-700/80 bg-green-100/50 px-2 py-0.5 rounded-full border border-green-200 ml-auto">
                {speechLocales[i18n.resolvedLanguage || i18n.language || 'en'] || 'en-IN'}
              </span>
            </>)}
          {voiceState === 'processing' && (<>
              <Loader2 className="w-4 h-4 animate-spin text-green-600 flex-shrink-0"/>
              <span>{t('voiceSearch.processing')}</span>
            </>)}
          {voiceState === 'error' && (<>
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0"/>
              <span className="font-medium">{voiceError}</span>
            </>)}
        </div>)}

      {/* Recent Searches Dropdown — only for logged-in users */}
      {showRecentSearches && (<div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Searches</span>
            <button onClick={handleClearAll} className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors">
              Clear all
            </button>
          </div>
          <ul>
            {recentSearches.map((entry) => (<li key={entry.id} onClick={() => handleRecentClick(entry.query)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors group">
                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>
                <span className="flex-1 text-sm text-gray-700">{entry.query}</span>
                <button onClick={(e) => handleRemoveRecent(e, entry.query)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-gray-200 transition-all">
                  <X className="w-3 h-3 text-gray-500"/>
                </button>
              </li>))}
          </ul>
        </div>)}

      {/* Search Results Dropdown */}
      {showProductResults && (<div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
          {filteredProducts.length > 0 ? (<ul className="max-h-96 overflow-y-auto">
              {filteredProducts.map(product => (<li key={product.id} onClick={() => handleProductClick(product.id)} className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors">
                  <img src={product.image} alt={t(`productsData.${product.name}`, product.name)} className="w-12 h-12 object-cover object-top rounded-md border border-gray-200"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t(`productsData.${product.name}`, product.name)}</p>
                    <p className="text-xs text-gray-500 flex gap-2">
                      <span>{t(`productsData.${product.mainCategory}`, product.mainCategory)}</span>
                      <span>•</span>
                      <span>{t(`productsData.${product.category}`, product.category)}</span>
                    </p>
                  </div>

                </li>))}
            </ul>) : (<div className="p-4 text-center text-gray-500 text-sm">
              {t('search.noResults')} "{query}"
            </div>)}
        </div>)}
    </div>);
}
