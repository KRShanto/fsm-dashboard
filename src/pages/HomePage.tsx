import { Link, useNavigate } from "react-router-dom";
import ProductsList from "../components/ProductsList";

export default function HomePage() {
  const navigate = useNavigate();

  const handleProductSelect = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Dashboard Home
      </h1>

      <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Products</h2>
          <Link
            to="/products/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer"
          >
            Add Product
          </Link>
        </div>
        <ProductsList onProductSelect={handleProductSelect} />
      </div>
    </div>
  );
}
