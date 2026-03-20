import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { SplashScreen } from "./components/SplashScreen";
import { CapabilitiesProvider } from "./contexts/CapabilitiesContext";

const queryClient = new QueryClient();

// Wrapper component for Index to handle navigation
const IndexWithLogout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const attendantName = localStorage.getItem("attendantName");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("attendantName");
    queryClient.clear();
    navigate("/login");
  };

  if (!token) {
    return null;
  }

  return (
    <CapabilitiesProvider>
      <Index attendantName={attendantName || ""} onLogout={handleLogout} />
    </CapabilitiesProvider>
  );
};

let splashShown = false;

const App = () => {
  const [showSplash, setShowSplash] = useState(!splashShown);

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => {
      splashShown = true;
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<IndexWithLogout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
