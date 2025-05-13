import { useState } from "react";
import { FiTrash2, FiEye, FiX } from "react-icons/fi";

export interface ProductImageProps {
  file?: File;
  url?: string;
  id?: number;
  isUploading?: boolean;
  onRemove: (index: number) => void;
  index: number;
}

export const ProductImagePreview = ({
  file,
  url,
  id,
  isUploading = false,
  onRemove,
  index,
}: ProductImageProps) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine image source - either a local File object or a remote URL
  const imgSrc = file ? URL.createObjectURL(file) : url;

  if (!imgSrc || imageError) {
    return (
      <div className="relative w-full aspect-square rounded-md overflow-hidden border border-input bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">Invalid image</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-80 hover:opacity-100"
          aria-label="Remove image"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative group w-full aspect-square rounded-md overflow-hidden border border-input">
        <img
          src={imgSrc}
          alt={`Product image ${index + 1}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/40 text-white transition-colors"
            aria-label="View image"
          >
            <FiEye size={16} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/40 text-white transition-colors"
            aria-label="Remove image"
          >
            <FiTrash2 size={16} />
          </button>
        </div>

        {/* Upload overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Delete button for quick access */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-80 hover:opacity-100"
          aria-label="Remove image"
        >
          <FiTrash2 size={14} />
        </button>

        {/* ID or status indicator */}
        {id && (
          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
            ID: {id}
          </div>
        )}
        {file && !id && (
          <div className="absolute bottom-1 left-1 bg-primary/70 text-white text-xs px-2 py-1 rounded">
            New
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg">
            <button
              type="button"
              onClick={() => setImageModalOpen(false)}
              className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md z-10"
              aria-label="Close modal"
            >
              <FiX size={24} />
            </button>
            <img
              src={imgSrc}
              alt={`Product image ${index + 1} (enlarged)`}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export interface ProductImageGridProps {
  images: Array<{ file?: File; url?: string; id?: number }>;
  isUploading?: boolean;
  onRemoveImage: (index: number) => void;
}

export default function ProductImageGrid({
  images,
  isUploading = false,
  onRemoveImage,
}: ProductImageGridProps) {
  // Filter out invalid images (those without a file or url)
  const validImages = images.filter((img) => img.file || img.url);

  if (validImages.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-md">
        <p className="text-gray-500">No images added yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Drag & drop images or use the button above
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
      {validImages.map((image, index) => (
        <ProductImagePreview
          key={image.id || index}
          file={image.file}
          url={image.url}
          id={image.id}
          isUploading={isUploading}
          onRemove={onRemoveImage}
          index={index}
        />
      ))}
    </div>
  );
}
