import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/ui/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import NewTrip from "./pages/NewTrip";
import TripHistory from "./pages/TripHistory";
import EditTrip from "./pages/EditTrip";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/new-trip" element={
                <ProtectedRoute>
                  <NewTrip />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <TripHistory />
                </ProtectedRoute>
              } />
              <Route path="/edit-trip/:id" element={
                <ProtectedRoute>
                  <EditTrip />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
