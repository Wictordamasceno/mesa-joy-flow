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

const queryClient = new QueryClient();

// Wrapper component for Index to handle navigation
const IndexWithLogout = () => {
  const navigate = useNavigate();
  const attendantName = localStorage.getItem("attendantName");

  // Redirect to login if not logged in
  useEffect(() => {
    if (!attendantName) {
      navigate("/login");
    }
  }, [attendantName, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("attendantName");
    navigate("/login");
  };

  if (!attendantName) {
    return null;
  }

  return <Index attendantName={attendantName} onLogout={handleLogout} />;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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
