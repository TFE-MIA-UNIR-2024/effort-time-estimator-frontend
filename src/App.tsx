
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
import NeedDetail from "./pages/NeedDetail";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { TooltipProvider as RadixTooltipProvider } from "@radix-ui/react-tooltip";

// Create a QueryClient instance inside the component to ensure it's created with React context
const App = () => {
  // Create a QueryClient instance inside the component
  const queryClient = new QueryClient();
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RadixTooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/need/:id" element={<NeedDetail />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RadixTooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
