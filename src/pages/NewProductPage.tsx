import { useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import PageTitle from "../components/PageTitle";
import PageHeader from "../components/PageHeader";

export default function NewProductPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/products");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <PageTitle title="Add New Product" />
      <PageHeader title="Add New Product" onBack={handleBack} />
      <ProductForm onSuccess={handleSuccess} />
    </>
  );
}
