import { useEffect, useState } from "react";
import { getProductById, deleteProduct } from "../lib/product-service";
import { getDocumentationByProductId } from "../lib/documentation-service";
import type { Product, StandardImage } from "../lib/product-service";
import type { Documentation } from "../lib/documentation-service";
import DocumentationList from "./DocumentationList";
import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface ProductDetailsProps {
  productId: number;
  onBack: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function ProductDetails({
  productId,
  onBack,
  onEdit,
  onDelete,
}: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<{ image_url: string }[]>([]);
  const [standardImages, setStandardImages] = useState<StandardImage[]>([]);
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const loadProductData = async () => {
    try {
      setLoading(true);
      // Load product details
      const productData = await getProductById(productId);
      if (!productData) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      setProduct(productData);

      // Get product images
      if (productData.images) {
        setImages(productData.images);
      }

      // Get standard images
      if (productData.standard_images) {
        setStandardImages(productData.standard_images);
      }

      // Load documentation
      const docsData = await getDocumentationByProductId(productId);
      setDocumentation(docsData);

      setLoading(false);
    } catch (error) {
      console.error("Error loading product:", error);
      setError("Failed to load product details");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const handleDeleteProduct = async () => {
    if (!product || isDeleting) return;

    setIsDeleting(true);
    try {
      const success = await deleteProduct(productId);
      if (success) {
        toast.success("Product deleted successfully");
        if (onDelete) {
          onDelete(productId);
        } else {
          onBack(); // Fallback to going back if no onDelete handler
        }
      } else {
        toast.error("Failed to delete the product. Please try again.");
        setIsDeleting(false);
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product.");
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-transparent border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
        <p>{error || "Product not found"}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Parse sectors if it's a string
  const sectors =
    typeof product.sectors === "string"
      ? JSON.parse(product.sectors)
      : product.sectors;

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product.heading}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" /> Back to Products
        </button>

        <div className="flex space-x-3">
          {onEdit && (
            <button
              onClick={() => onEdit(productId)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <FiEdit className="mr-2" /> Edit Product
            </button>
          )}

          <button
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <FiTrash2 className="mr-2" />{" "}
            {isDeleting ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImageIndex].image_url}
                alt={product.heading}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 border-2 rounded overflow-hidden flex-shrink-0 ${
                    idx === activeImageIndex
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">{product.subheading}</p>
            <h1 className="text-2xl font-bold">{product.heading}</h1>
          </div>

          <div>
            <h3 className="font-medium mb-1">Reference</h3>
            <p className="text-gray-700">{product.reference}</p>
          </div>

          {product.brand && (
            <div>
              <h3 className="font-medium mb-1">Brand</h3>
              <p className="text-gray-700">{product.brand}</p>
            </div>
          )}

          {product.technical_file_url && (
            <div>
              <h3 className="font-medium mb-1">Technical File</h3>
              <a
                href={product.technical_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Technical File
              </a>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-1">Size</h3>
            <p className="text-gray-700">{product.size}</p>
          </div>

          {sectors && sectors.length > 0 && (
            <div>
              <h3 className="font-medium mb-1">Sectors</h3>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <div className="text-gray-700 mb-6">
          <p>{product.short_description}</p>
        </div>

        <div
          className="tiptap"
          dangerouslySetInnerHTML={{ __html: product.long_description }}
        />
      </div>

      {/* Standards with Images */}
      {(product.standards || standardImages.length > 0) && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Standards</h2>

          {product.standards && (
            <div
              className="tiptap mb-6"
              dangerouslySetInnerHTML={{ __html: product.standards }}
            />
          )}

          {/* Standard Images - Grid Layout */}
          {standardImages.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-3">Standard Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {standardImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <a
                      href={img.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      <img
                        src={img.image_url}
                        alt={`Standard ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documentation */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Documentation</h2>
        <DocumentationList
          documents={documentation}
          emptyMessage="No documentation available for this product"
          readOnly={true}
        />
      </div>
    </div>
  );
}
