import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import EcoPage from './pages/EcoPage';
import WellnessPage from './pages/WellnessPage';
import FoodPage from './pages/FoodPage';
import CraftPage from './pages/CraftPage';
import FashionPage from './pages/FashionPage';
import DecorItemsPage from './pages/DecorItemsPage';
import ProductDetail from './pages/ProductDetail';
import Footer from './components/Footer/Footer';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/profile/ProfilePage';
import MyProfile from './pages/profile/MyProfile';
import MyOrders from './pages/profile/MyOrders';
import OrderTrackingPage from './pages/profile/OrderTrackingPage';
import Notifications from './pages/profile/Notifications';
import AddressPage from './pages/profile/AddressPage';
import HelpSupport from './pages/profile/HelpSupport';
import EcoImpact from './pages/profile/EcoImpact';
import SizeProfile from './pages/profile/SizeProfile';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileGuard from './components/ProfileGuard';
import ProfileCompletion from './pages/ProfileCompletion';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { LoginPromptProvider } from './context/LoginPromptContext';
import CartDrawer from './components/Cart/CartDrawer';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
function App() {
    return (<AuthProvider>
      <BrowserRouter>
        <LoginPromptProvider>
          <WishlistProvider>
            <CartProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/profile-completion" element={<ProfileCompletion />}/>
                
                {/* All main app routes are protected by ProfileGuard */}
                <Route path="/*" element={<ProfileGuard>
                    <Routes>
                      <Route path="/" element={<Home />}/>
                      <Route path="/eco" element={<EcoPage />}/>
                      <Route path="/wellness" element={<WellnessPage />}/>
                      <Route path="/food" element={<FoodPage />}/>
                      <Route path="/craft" element={<CraftPage />}/>
                      <Route path="/fashion" element={<FashionPage />}/>
                      <Route path="/decor" element={<DecorItemsPage />}/>
                      <Route path="/product/:id" element={<ProductDetail />}/>
                      <Route path="/wishlist" element={<WishlistPage />}/>
                      <Route path="/checkout" element={<CheckoutPage />}/>
                      <Route path="/search" element={<SearchResultsPage />}/>

                      {/* Profile routes - additionally protected by ProtectedRoute */}
                      <Route path="/profile" element={<ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>}>
                        <Route index element={<MyProfile />}/>
                        <Route path="orders" element={<MyOrders />}/>
                        <Route path="orders/:orderId" element={<OrderTrackingPage />}/>
                        <Route path="size-profile" element={<SizeProfile />}/>
                        <Route path="eco-impact" element={<EcoImpact />}/>
                        <Route path="notifications" element={<Notifications />}/>
                        <Route path="address" element={<AddressPage />}/>
                        <Route path="help" element={<HelpSupport />}/>
                      </Route>
                    </Routes>
                  </ProfileGuard>}/>
              </Routes>
            </div>
            <Footer />
            <CartDrawer />
            <ChatbotWidget />
          </div>
            </CartProvider>
          </WishlistProvider>
        </LoginPromptProvider>
      </BrowserRouter>
    </AuthProvider>);
}
export default App;
