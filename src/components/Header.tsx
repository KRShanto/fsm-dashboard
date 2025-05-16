import { NavLink } from "react-router-dom";
import supabase from "../supabase-client";
import { FiHome, FiPackage, FiLogOut } from "react-icons/fi";

export default function Header() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <NavLink
            to="/"
            className="text-2xl font-bold text-foreground hover:text-foreground"
          >
            Fire & Safety Management
          </NavLink>
          <nav className="flex space-x-6 items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-primary font-medium flex items-center cursor-pointer"
                  : "text-foreground hover:text-primary flex items-center cursor-pointer"
              }
              end
            >
              <FiHome className="mr-1" /> Dashboard
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive
                  ? "text-primary font-medium flex items-center cursor-pointer"
                  : "text-foreground hover:text-primary flex items-center cursor-pointer"
              }
            >
              <FiPackage className="mr-1" /> Products
            </NavLink>
            <button
              onClick={handleSignOut}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center cursor-pointer"
            >
              <FiLogOut className="mr-1" /> Sign Out
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
