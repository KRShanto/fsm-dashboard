import { Link, useNavigate } from "react-router-dom";
import ProductsList from "../components/ProductsList";
import PageTitle from "../components/PageTitle";
import PageHeader from "../components/PageHeader";

export default function ProductsPage() {
  const navigate = useNavigate();

  const handleProductSelect = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleBack = () => {
    navigate("/");
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
      <PageTitle title="Products" />
      <PageHeader
        title="Products"
        onBack={handleBack}
        backLabel="Back to Dashboard"
        actions={addProductButton}
      />
      <ProductsList onProductSelect={handleProductSelect} />
    </>
  );
}
