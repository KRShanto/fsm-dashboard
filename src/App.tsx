import { useEffect } from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import supabase from "./supabase-client";
import type { Session } from "@supabase/supabase-js";
import DashboardLayout from "./layouts/DashboardLayout";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NewProductPage from "./pages/NewProductPage";
import EditProductPage from "./pages/EditProductPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthChecked(true);
    });

    // Clean up subscription
    return () => subscription.unsubscribe();
  }, []);

  // Set a minimum loading time of 2 seconds
  useEffect(() => {
    if (authChecked) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [authChecked]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Fire & Safety Management
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Welcome to the dashboard
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-10 h-10 border-4 border-t-indigo-600 border-b-indigo-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products">
            <Route index element={<ProductsPage />} />
            <Route path="new" element={<NewProductPage />} />
            <Route path=":id" element={<ProductDetailPage />} />
            <Route path=":id/edit" element={<EditProductPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
