import { useEffect } from "react";
import { useState } from "react";
import Dashboard from "./Dashboard";
import Login from "./components/Login";
import supabase from "./supabase-client";
import type { Session } from "@supabase/supabase-js";

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Fire & Safety Management
          </h1>
          <p className="text-gray-600">Welcome to the dashboard</p>
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-4 border-t-indigo-600 border-b-indigo-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;
