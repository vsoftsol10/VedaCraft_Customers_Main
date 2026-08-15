import { createContext, useContext, useState } from 'react';
import { LogIn, ShoppingBag, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginPromptContext = createContext(undefined);

const promptCopy = {
  cart: {
    title: 'Login to add to cart',
    message: 'Save products to your cart and continue checkout securely after signing in.',
  },
  wishlist: {
    title: 'Login to use wishlist',
    message: 'Keep your favorite products saved across devices after signing in.',
  },
  default: {
    title: 'Login required',
    message: 'Please login first to continue with this action.',
  },
};

export function LoginPromptProvider({ children }) {
  const [prompt, setPrompt] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const showLoginPrompt = (type = 'default') => {
    setPrompt(promptCopy[type] || promptCopy.default);
  };

  const closePrompt = () => setPrompt(null);

  const goToLogin = () => {
    const redirect = `${location.pathname}${location.search}`;
    closePrompt();
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <LoginPromptContext.Provider value={{ showLoginPrompt }}>
      {children}

      {prompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="relative bg-gradient-to-br from-green-700 via-emerald-600 to-lime-500 px-6 py-5 text-white">
              <button
                type="button"
                onClick={closePrompt}
                aria-label="Close login prompt"
                className="absolute right-3 top-3 rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">{prompt.title}</h2>
              <p className="mt-1 text-sm leading-5 text-white/90">{prompt.message}</p>
            </div>

            <div className="space-y-3 px-6 py-5">
              <button
                type="button"
                onClick={goToLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800"
              >
                <LogIn className="h-4 w-4" />
                Login first
              </button>
              <button
                type="button"
                onClick={closePrompt}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </LoginPromptContext.Provider>
  );
}

export function useLoginPrompt() {
  const context = useContext(LoginPromptContext);

  if (context === undefined) {
    throw new Error('useLoginPrompt must be used within a LoginPromptProvider');
  }

  return context;
}
