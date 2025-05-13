import { useState } from "react";
import Header from "./components/Header";
import ProductForm from "./components/ProductForm";
import ProductsList from "./components/ProductsList";

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">Products</h1>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "View Products" : "Add New Product"}
              </button>
            </div>

            {showForm ? (
              <div className="bg-card shadow-sm rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">
                  Add New Product
                </h2>
                <ProductForm />
              </div>
            ) : (
              <div className="bg-card shadow-sm rounded-lg p-6">
                <ProductsList />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
