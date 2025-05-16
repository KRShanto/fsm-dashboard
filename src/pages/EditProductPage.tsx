import { useParams, useNavigate } from "react-router-dom";
import EditProductForm from "../components/EditProductForm";
import PageTitle from "../components/PageTitle";
import PageHeader from "../components/PageHeader";
import { useEffect, useState } from "react";
import { getProductById } from "../lib/product-service";

export default function EditProductPage() {
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

  const handleSuccess = () => {
    navigate(`/products/${productId}`);
  };

  return (
    <>
      <PageTitle title={`Edit ${productName || `Product ${id}`}`} />
      <PageHeader title="Edit Product" onBack={handleBack} />
      <EditProductForm
        productId={productId}
        onBack={handleBack}
        onSuccess={handleSuccess}
      />
    </>
  );
}
