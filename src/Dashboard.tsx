import Header from "./components/Header";
import ProductForm from "./components/ProductForm";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-card shadow-sm rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">
                Add New Product
              </h2>
              <ProductForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
