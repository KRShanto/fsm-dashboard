import { useEffect, useState } from "react";
import { getAllProducts } from "../lib/product-service";
import type { Product } from "../lib/product-service";

type ProductWithImage = Product & { primary_image?: string };

export default function ProductsList() {
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
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-lg text-gray-500">No products found</p>
        <p className="text-sm text-gray-400 mt-2">
          Click the "Add New Product" button to create your first product
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        Showing {products.length} product{products.length !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-gray-100 relative">
              {product.primary_image ? (
                <img
                  src={product.primary_image}
                  alt={product.heading}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, replace with placeholder
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}

              {/* Category badge */}
              {product.sectors && product.sectors.length > 0 && (
                <div className="absolute top-2 left-2">
                  <span className="bg-primary/80 text-white text-xs px-2 py-1 rounded-full">
                    {typeof product.sectors === "string"
                      ? product.sectors
                      : Array.isArray(product.sectors)
                      ? product.sectors[0]
                      : "Uncategorized"}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-500">{product.subheading}</p>
              <h3 className="text-lg font-semibold mt-1">{product.heading}</h3>
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                {product.short_description}
              </p>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Ref: {product.reference}
                </span>
                <button
                  className="px-4 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
                  onClick={() => {
                    // TODO: View product details
                  }}
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
