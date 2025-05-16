import { Link, useNavigate } from "react-router-dom";
import ProductsList from "../components/ProductsList";
import { FiArrowLeft } from "react-icons/fi";

export default function ProductsPage() {
  const navigate = useNavigate();

  const handleProductSelect = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <>
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-foreground hover:text-primary mr-4 cursor-pointer"
        >
          <FiArrowLeft className="mr-1" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <div className="flex-grow"></div>
        <Link
          to="/products/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer"
        >
          Add Product
        </Link>
      </div>
      <ProductsList onProductSelect={handleProductSelect} />
    </>
  );
}
