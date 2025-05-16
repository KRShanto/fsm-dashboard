import { useParams, useNavigate } from "react-router-dom";
import ProductDetails from "../components/ProductDetails";
import { FiArrowLeft } from "react-icons/fi";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = id ? parseInt(id) : null;

  if (!productId) {
    return <div>Invalid product ID</div>;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = (id: number) => {
    navigate(`/products/${id}/edit`);
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
        <h1 className="text-2xl font-bold text-foreground">Product Details</h1>
      </div>
      <ProductDetails
        productId={productId}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </div>
  );
}
