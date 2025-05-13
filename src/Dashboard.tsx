import { useState } from "react";
import Header from "./components/Header";
import ProductForm from "./components/ProductForm";
import ProductsList from "./components/ProductsList";
import ProductDetails from "./components/ProductDetails";
import EditProductForm from "./components/EditProductForm";

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [viewMode, setViewMode] = useState<
    "list" | "details" | "form" | "edit"
  >("list");

  const handleAddProduct = () => {
    setViewMode("form");
    setShowForm(true);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedProductId(null);
    setShowForm(false);
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProductId(productId);
    setViewMode("details");
  };

  const handleEditProduct = (productId: number) => {
    setSelectedProductId(productId);
    setViewMode("edit");
  };

  const handleEditSuccess = () => {
    if (selectedProductId) {
      setViewMode("details");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {viewMode === "list" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-foreground">
                    Products
                  </h1>
                  <button
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    onClick={handleAddProduct}
                  >
                    Add Product
                  </button>
                </div>
                <ProductsList onProductSelect={handleProductSelect} />
              </>
            )}

            {viewMode === "form" && showForm && <ProductForm />}

            {viewMode === "details" && selectedProductId && (
              <ProductDetails
                productId={selectedProductId}
                onBack={handleBackToList}
                onEdit={handleEditProduct}
              />
            )}

            {viewMode === "edit" && selectedProductId && (
              <EditProductForm
                productId={selectedProductId}
                onBack={() => setViewMode("details")}
                onSuccess={handleEditSuccess}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
