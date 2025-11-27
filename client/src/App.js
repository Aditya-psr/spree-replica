import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ShopAll from "./pages/ShopAll";
import Fashion from "./pages/Fashion";
import Wellness from "./pages/Wellness";
import NewArrival from "./pages/NewArrival";
import Sale from "./pages/Sale";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import MyAccount from "./pages/MyAccount";

import { AuthProvider } from "./context/AuthProvider";
import { WishlistProvider } from "./context/WishlistProvider";
import { CartProvider } from "./context/CartProvider";
import { CurrencyProvider } from "./context/CurrencyContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import ProductDetail from "./Components/ProductDetail";

import CartDrawer from "./Components/CartDrawer";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen w-full overflow-x-hidden relative">
              <Header />
              <Navbar />

              <main className="flex-grow w-full">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/ShopAll" element={<ShopAll />} />
                  <Route path="/Fashion" element={<Fashion />} />
                  <Route path="/Wellness" element={<Wellness />} />
                  <Route path="/NewArrival" element={<NewArrival />} />
                  <Route path="/Login" element={<Login />} />
                  <Route path="/SignUp" element={<SignUp />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/Sale" element={<Sale />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route
                    path="/:category/:subcategory?/:type?"
                    element={<CategoryPage />}
                  />
                  <Route path="/product/:id" element={<ProductDetail />} />

                  <Route
                    path="/myaccount"
                    element={
                      <ProtectedRoute>
                        <MyAccount />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>

              <CartDrawer />
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}

export default App;
