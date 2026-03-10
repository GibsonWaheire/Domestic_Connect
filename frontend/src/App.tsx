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
import AgencyPage from "./pages/AgencyPage";
import AgencyMarketplace from "./pages/AgencyMarketplace";
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
import AgencyPackagesPage from "./pages/AgencyPackagesPage";
import ContactUsPage from "./pages/ContactUsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

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

const RouteTitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/home") {
      document.title = "Domestic Connect | Find House Help Kenya";
      return;
    }
    if (location.pathname === "/housegirls") {
      document.title = "Browse Domestic Workers | Domestic Connect Kenya";
      return;
    }
    if (location.pathname === "/login") {
      document.title = "Sign In | Domestic Connect";
      return;
    }
    document.title = "Domestic Connect | Find Trusted House Help in Kenya";
  }, [location.pathname]);

  return null;
};

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
        <AuthProvider>
          <HelmetProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/register" element={<Navigate to="/login?mode=signup" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/why-choose-us" element={<WhyChoosePage />} />
                <Route path="/agency-packages" element={<AgencyPackagesPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/housegirls" element={<HousegirlsListPage />} />
                <Route path="/agencies" element={<AgencyPage />} />
                <Route path="/agency-marketplace" element={<AgencyMarketplace />} />
                <Route path="/browse-housegirls" element={<BrowseHousegirls />} />

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
                    <AuthGuard allowedUserTypes={['agency']}>
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
