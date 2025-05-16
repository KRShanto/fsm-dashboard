import { useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { FiArrowLeft } from "react-icons/fi";

export default function NewProductPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/products");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-foreground hover:text-primary mr-4 cursor-pointer"
        >
          <FiArrowLeft className="mr-1" /> Back
        </button>
        <h1 className="text-2xl font-bold text-foreground">Add New Product</h1>
      </div>
      <ProductForm onSuccess={handleSuccess} />
    </div>
  );
}
