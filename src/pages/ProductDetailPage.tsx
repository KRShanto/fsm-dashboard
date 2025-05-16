import { useParams, useNavigate } from "react-router-dom";
import ProductDetails from "../components/ProductDetails";
import PageTitle from "../components/PageTitle";
import PageHeader from "../components/PageHeader";
import { useEffect, useState } from "react";
import { getProductById } from "../lib/product-service";
import { FiEdit } from "react-icons/fi";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productName, setProductName] = useState<string>("");

  useEffect(() => {
    if (id) {
      // Fetch product name for the title
      const fetchProductName = async () => {
        try {
          const product = await getProductById(parseInt(id));
          if (product) {
            setProductName(product.heading);
          }
        } catch (error) {
          console.error("Error fetching product name:", error);
        }
      };

      fetchProductName();
    }
  }, [id]);

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

  const actionButtons = (
    <div className="flex space-x-3">
      <button
        onClick={() => handleEdit(productId)}
        className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 cursor-pointer"
      >
        <FiEdit className="mr-2" /> Edit Product
      </button>
    </div>
  );

  return (
    <>
      <PageTitle title={productName || `Product ${id}`} />
      <PageHeader
        title="Product Details"
        onBack={handleBack}
        actions={actionButtons}
      />
      <ProductDetails
        productId={productId}
        onBack={handleBack}
        onEdit={handleEdit}
        showHeader={false}
      />
    </>
  );
}
