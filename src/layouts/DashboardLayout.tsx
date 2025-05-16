import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
