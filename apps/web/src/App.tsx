import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/admin/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AuthProvider } from './hooks/useAuth';
import { LoadingState } from './components/common/LoadingState';

// ── Public pages ─────────────────────────────────────────────────────────────
const HomePage               = lazy(() => import('./pages/public/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage              = lazy(() => import('./pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const ApartmentsPage         = lazy(() => import('./pages/public/ApartmentsPage').then(m => ({ default: m.ApartmentsPage })));
const BedroomListingPage     = lazy(() => import('./pages/public/BedroomListingPage').then(m => ({ default: m.BedroomListingPage })));
const ApartmentDetailPage    = lazy(() => import('./pages/public/ApartmentDetailPage').then(m => ({ default: m.ApartmentDetailPage })));
const ContactPage            = lazy(() => import('./pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const TourPage               = lazy(() => import('./pages/public/TourPage').then(m => ({ default: m.TourPage })));
const PrivacyPage            = lazy(() => import('./pages/public/LegalPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage              = lazy(() => import('./pages/public/LegalPage').then(m => ({ default: m.TermsPage })));

// ── Admin pages ───────────────────────────────────────────────────────────────
const AdminLoginPage         = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const DashboardPage          = lazy(() => import('./pages/admin/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AdminApartmentsPage    = lazy(() => import('./pages/admin/AdminApartmentsPage').then(m => ({ default: m.AdminApartmentsPage })));
const AdminApartmentDetailPage = lazy(() => import('./pages/admin/AdminApartmentDetailPage').then(m => ({ default: m.AdminApartmentDetailPage })));
const AddApartmentPage       = lazy(() => import('./pages/admin/AddApartmentPage').then(m => ({ default: m.AddApartmentPage })));
const AdminCustomersPage     = lazy(() => import('./pages/admin/AdminCustomersPage').then(m => ({ default: m.AdminCustomersPage })));
const AdminInquiriesPage     = lazy(() => import('./pages/admin/AdminInquiriesPage').then(m => ({ default: m.AdminInquiriesPage })));
const InquiryDetailPage      = lazy(() => import('./pages/admin/InquiryDetailPage').then(m => ({ default: m.InquiryDetailPage })));
const AddCustomerPage        = lazy(() => import('./pages/admin/AddCustomerPage').then(m => ({ default: m.AddCustomerPage })));
const CustomerDetailPage     = lazy(() => import('./pages/admin/CustomerDetailPage').then(m => ({ default: m.CustomerDetailPage })));

function PageFallback() {
  return <LoadingState label="Loading…" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="apartments" element={<ApartmentsPage />} />
              <Route path="apartments/2-bedroom" element={<BedroomListingPage />} />
              <Route path="apartments/3-bedroom" element={<BedroomListingPage />} />
              <Route path="apartments/:id" element={<ApartmentDetailPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="tour" element={<TourPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
            </Route>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="apartments" element={<AdminApartmentsPage />} />
              <Route path="apartments/new" element={<AddApartmentPage />} />
              <Route path="apartments/:id" element={<AdminApartmentDetailPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="customers/new" element={<AddCustomerPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="inquiries" element={<AdminInquiriesPage />} />
              <Route path="inquiries/:id" element={<InquiryDetailPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
