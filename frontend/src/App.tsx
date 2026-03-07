import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuthEnhanced";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthGuard } from "@/components/AuthGuard";
import LandingPage from "./pages/LandingPage";
import HousegirlPage from "./pages/HousegirlPage";
import AgencyPage from "./pages/AgencyPage";
import AgencyMarketplace from "./pages/AgencyMarketplace";
import EmployerDashboard from "./pages/EmployerDashboard";
import HousegirlDashboard from "./pages/HousegirlDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import BrowseHousegirls from "./pages/BrowseHousegirls";
import Auth from "./pages/Auth";
import HowItWorksPage from "./pages/HowItWorksPage";
import StatsPage from "./pages/StatsPage";
import WhyChoosePage from "./pages/WhyChoosePage";
import AgencyPackagesPage from "./pages/AgencyPackagesPage";
import ContactUsPage from "./pages/ContactUsPage";

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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HelmetProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/why-choose-us" element={<WhyChoosePage />} />
                <Route path="/agency-packages" element={<AgencyPackagesPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/housegirls" element={<HousegirlPage />} />
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
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
