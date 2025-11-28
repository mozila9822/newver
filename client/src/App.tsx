import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { StoreProvider } from "@/lib/store-context";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TripsPage from "@/pages/trips";
import HotelsPage from "@/pages/hotels";
import CarsPage from "@/pages/cars";
import AdminDashboard from "@/pages/admin";
import LastMinutePage from "@/pages/last-minute";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import TermsOfServicePage from "@/pages/terms-of-service";

import DetailsPage from "@/pages/details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/trips" component={TripsPage} />
      <Route path="/hotels" component={HotelsPage} />
      <Route path="/cars" component={CarsPage} />
      <Route path="/last-minute" component={LastMinutePage} />
      <Route path="/details/:type/:slug" component={DetailsPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/login" component={LoginPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms-of-service" component={TermsOfServicePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;