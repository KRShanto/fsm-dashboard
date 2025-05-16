import { useParams, useNavigate } from "react-router-dom";
import EditProductForm from "../components/EditProductForm";
import { FiArrowLeft } from "react-icons/fi";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = id ? parseInt(id) : null;

  if (!productId) {
    return <div>Invalid product ID</div>;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate(`/products/${productId}`);
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
        <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
      </div>
      <EditProductForm
        productId={productId}
        onBack={handleBack}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
