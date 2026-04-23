import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import AvatarSetup from "./pages/AvatarSetup";
import Briefing from "./pages/Briefing";
import Dashboard from "./pages/Dashboard";
import Mission from "./pages/Mission";
import FVM from "./pages/FVM";
import Admin from "./pages/Admin";
import Social from "./pages/Social";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup" element={<AvatarSetup />} />
            <Route path="/briefing" element={<Briefing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/missao" element={<Mission />} />
            <Route path="/fvm" element={<FVM />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/social" element={<Social />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
