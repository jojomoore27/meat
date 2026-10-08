import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import MessageUsWidget from './components/chat/MessageUsWidget';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import OurFarm from './pages/public/OurFarm';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Faqs from './pages/public/Faqs';
import Contact from './pages/public/Contact';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsConditions from './pages/public/TermsConditions';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrderRequests from './pages/admin/AdminOrderRequests';
import AdminWholesaleRequests from './pages/admin/AdminWholesaleRequests';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminGallery from './pages/admin/AdminGallery';
import AdminMessages from './pages/admin/AdminMessages';
import AdminCms from './pages/admin/AdminCms';
import AdminMediaLibrary from './pages/admin/AdminMediaLibrary';
import AdminFaqs from './pages/admin/AdminFaqs';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminNotificationSettings from './pages/admin/AdminNotificationSettings';
import AdminSettings from './pages/admin/AdminSettings';

// Protected Admin Route wrapper
function ProtectedAdminRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0c120e]">
        <div className="w-10 h-10 border-4 border-farm-grass border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

// Public Page Shell
function PublicShell({ children }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      {isHomePage && <Footer />}
      <MessageUsWidget />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<PublicShell><Home /></PublicShell>} />
            <Route path="/about" element={<PublicShell><About /></PublicShell>} />
            <Route path="/our-farm" element={<PublicShell><OurFarm /></PublicShell>} />
            <Route path="/products" element={<PublicShell><Products /></PublicShell>} />
            <Route path="/products/:slug" element={<PublicShell><ProductDetail /></PublicShell>} />
            <Route path="/faqs" element={<PublicShell><Faqs /></PublicShell>} />
            <Route path="/contact" element={<PublicShell><Contact /></PublicShell>} />
            <Route path="/privacy-policy" element={<PublicShell><PrivacyPolicy /></PublicShell>} />
            <Route path="/terms-conditions" element={<PublicShell><TermsConditions /></PublicShell>} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Console Pages */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrderRequests /></ProtectedAdminRoute>} />
            <Route path="/admin/wholesale" element={<ProtectedAdminRoute><AdminWholesaleRequests /></ProtectedAdminRoute>} />
            <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
            <Route path="/admin/categories" element={<ProtectedAdminRoute><AdminCategories /></ProtectedAdminRoute>} />
            <Route path="/admin/gallery" element={<ProtectedAdminRoute><AdminGallery /></ProtectedAdminRoute>} />
            <Route path="/admin/messages" element={<ProtectedAdminRoute><AdminMessages /></ProtectedAdminRoute>} />
            <Route path="/admin/cms" element={<ProtectedAdminRoute><AdminCms /></ProtectedAdminRoute>} />
            <Route path="/admin/media" element={<ProtectedAdminRoute><AdminMediaLibrary /></ProtectedAdminRoute>} />
            <Route path="/admin/faqs" element={<ProtectedAdminRoute><AdminFaqs /></ProtectedAdminRoute>} />
            <Route path="/admin/testimonials" element={<ProtectedAdminRoute><AdminTestimonials /></ProtectedAdminRoute>} />
            <Route path="/admin/notifications" element={<ProtectedAdminRoute><AdminNotificationSettings /></ProtectedAdminRoute>} />
            <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />

            {/* 404 Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
