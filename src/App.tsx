import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { SplashScreen } from "./components/SplashScreen";
import { IconGenerator } from "./components/IconGenerator";

const queryClient = new QueryClient();

// Mude para true para acessar o gerador de ícone
const SHOW_ICON_GENERATOR = true;

const App = () => {
  if (SHOW_ICON_GENERATOR) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <IconGenerator />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Modo edição: mostrar apenas a splash screen sempre
  return <SplashScreen onComplete={() => {}} />;
};

export default App;
