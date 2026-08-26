import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuthEnhanced";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthGuard } from "@/components/AuthGuard";
import LandingPage from "./pages/LandingPage";
import HousegirlsListPage from "./pages/HousegirlsListPage";
import HousegirlPage from "./pages/HousegirlPage";
import EmployerDashboard from "./pages/EmployerDashboard";
import HousegirlDashboard from "./pages/HousegirlDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import BrowseHousegirls from "./pages/BrowseHousegirls";

import LoginPage from "./pages/LoginPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import StatsPage from "./pages/StatsPage";
import WhyChoosePage from "./pages/WhyChoosePage";
import ContactUsPage from "./pages/ContactUsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import PaymentCallbackPage from "./pages/PaymentCallbackPage";
import ForHousegirlsPage from "./pages/ForHousegirlsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AuthActionPage from "./pages/AuthActionPage";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const PAGE_TITLES: Record<string, string> = {
  "/": "Domestic Connect Kenya | Vetted Domestic Staff — Housegirls, Nannies, Caregivers",
  "/home": "Domestic Connect Kenya | Vetted Domestic Staff — Housegirls, Nannies, Caregivers",
  "/how-it-works": "How It Works | Domestic Connect Kenya",
  "/why-choose-us": "Why Choose Domestic Connect Kenya | Vetted Domestic Staffing Agency",
  "/contact-us": "Contact Us | Domestic Connect Kenya",
  "/contact": "Contact Us | Domestic Connect Kenya",
  "/login": "Register or Log In | Domestic Connect Kenya",
  "/for-housegirls": "Join as a Domestic Worker | Domestic Connect Kenya",
  "/privacy-policy": "Privacy Policy | Domestic Connect Kenya",
  "/terms": "Terms of Service | Domestic Connect Kenya",
};

const RouteTitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname];
    document.title = title || "Domestic Connect Kenya | Find Trusted House Help";
  }, [location.pathname]);

  return null;
};

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  return null;
};

// Phone modal is now handled inside HousegirlDashboard using profileData as source of truth
const PhoneGate = () => null;

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <RouteTitleManager />
        <ScrollToTop />
        <AuthProvider>
          <HelmetProvider>
            <TooltipProvider>
              <CookieConsentBanner />
              <PhoneGate />
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/register" element={<Navigate to="/login?mode=signup" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/auth/action" element={<AuthActionPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/why-choose-us" element={<WhyChoosePage />} />
                {/* Suppressed agency/browse routes — redirect without deleting files */}
                <Route path="/agency-packages" element={<Navigate to="/how-it-works" replace />} />
                <Route path="/agencies" element={<Navigate to="/" replace />} />
                <Route path="/agency-marketplace" element={<Navigate to="/login" replace />} />
                <Route path="/browse-housegirls" element={<Navigate to="/" replace />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/housegirls" element={<HousegirlsListPage />} />
                <Route path="/browse-housegirls-admin" element={<BrowseHousegirls />} />
                <Route
                  path="/payment-callback"
                  element={
                    <AuthGuard allowedUserTypes={['employer', 'agency', 'admin']}>
                      <PaymentCallbackPage />
                    </AuthGuard>
                  }
                />
                <Route path="/for-housegirls" element={<ForHousegirlsPage />} />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/housegirl-dashboard"
                  element={
                    <AuthGuard allowedUserTypes={['housegirl']}>
                      <HousegirlDashboard />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/agency-dashboard"
                  element={
                    <AuthGuard allowedUserTypes={['agency']} unauthenticatedRedirect="/admin/login">
                      <AgencyDashboard />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/employer-dashboard"
                  element={
                    <AuthGuard allowedUserTypes={['employer']}>
                      <EmployerDashboard />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <AuthGuard allowedUserTypes={['admin']}>
                      <AdminDashboard />
                    </AuthGuard>
                  }
                />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </HelmetProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
