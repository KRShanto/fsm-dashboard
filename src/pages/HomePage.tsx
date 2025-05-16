import { Link, useNavigate } from "react-router-dom";
import ProductsList from "../components/ProductsList";
import PageTitle from "../components/PageTitle";
import PageHeader from "../components/PageHeader";

export default function HomePage() {
  const navigate = useNavigate();

  const handleProductSelect = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const addProductButton = (
    <Link
      to="/products/new"
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer"
    >
      Add Product
    </Link>
  );

  return (
    <>
      <PageTitle title="Dashboard" />
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard cards would go here */}
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            {addProductButton}
          </div>
          <ProductsList onProductSelect={handleProductSelect} />
        </div>
      </div>
    </>
  );
}
