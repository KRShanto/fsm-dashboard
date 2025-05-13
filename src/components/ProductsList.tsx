import { useEffect, useState } from "react";
import { getAllProducts } from "../lib/product-service";
import type { Product } from "../lib/product-service";

type ProductWithImage = Product & { primary_image?: string };

interface ProductsListProps {
  onProductSelect: (productId: number) => void;
}

export default function ProductsList({ onProductSelect }: ProductsListProps) {
  const [products, setProducts] = useState<ProductWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getAllProducts();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading products:", error);
        setError("Failed to load products");
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-transparent border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-md">
        <p className="text-gray-500">No products found</p>
        <p className="text-gray-400 text-sm mt-1">
          Add a new product to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => product.id && onProductSelect(product.id)}
        >
          <div className="aspect-video bg-gray-100">
            {product.primary_image ? (
              <img
                src={product.primary_image}
                alt={product.heading}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="mb-1 text-xs text-gray-500">
              {product.subheading}
            </div>
            <h2 className="font-semibold text-gray-800 mb-2">
              {product.heading}
            </h2>
            <p className="text-gray-600 text-sm line-clamp-2">
              {product.short_description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
