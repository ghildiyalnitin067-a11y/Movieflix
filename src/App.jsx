import React from "react";
import "./App.css";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SubscriptionGuard from "./components/SubscriptionGuard";
import TrialBanner from "./components/TrialBanner";

import Home from "./pages/Home";
import Movies from "./pages/Movies/Movies";
import MovieView from "./pages/MovieView/MovieView";
import CategoryMovies from "./pages/Category/CategoryMovies";
import Subscription from "./pages/Subscription/subscription";
import Payment from "./pages/Subscription/Payment";
import Support from "./pages/support";
import Login from "./pages/Login/Login";
import Account from "./pages/Account/Account";
import MyList from "./pages/MyList/MyList";
import SearchResults from "./pages/Search/SearchResult";
import AdminPanel from "./pages/Admin/AdminPanel";

import { TrialProvider } from "./context/TrialContext";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";

import ProfileSelector from "./components/ProfileSelector/ProfileSelector";
import ProfileManager from "./components/ProfileManager/ProfileManager";



const Layout = ({ children }) => {
  const location = useLocation();


  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/payment";

  const hideFooterRoutes = [
    "/login",
    "/payment",
    "/account",
    "/my-list",
    "/admin",
  ];

  const hideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {!hideNavbar && <TrialBanner />}

      {children}

      {!hideFooter && <Footer />}
    </>
  );
};



const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/support" element={<Support />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/category/:genreId" element={<CategoryMovies />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account" element={<Account />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/my-list" element={<MyList />} />
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Profile Routes */}
        <Route path="/profiles" element={<ProfileSelector />} />
        <Route path="/create-profile" element={<ProfileManager mode="create" />} />
        <Route path="/manage-profile/:profileId" element={<ProfileManager mode="edit" />} />
        
        {/* Main App Route (after profile selection) */}
        <Route path="/browse" element={<Home />} />

      
        <Route

          path="/movie/:id"
          element={
            <SubscriptionGuard>
              <MovieView />
            </SubscriptionGuard>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};


const App = () => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <TrialProvider>
          <ScrollToTop />

          <Layout>
            <AnimatedRoutes />
          </Layout>
        </TrialProvider>
      </ProfileProvider>
    </AuthProvider>
  );
};


export default App;
