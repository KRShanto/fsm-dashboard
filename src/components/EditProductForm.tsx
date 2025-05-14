import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import {
  FiPlus,
  FiTrash2,
  FiUpload,
  FiFile,
  FiArrowLeft,
} from "react-icons/fi";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useDropzone } from "react-dropzone";
import { getProductById, updateProduct } from "../lib/product-service";
import {
  getDocumentationByProductId,
  deleteDocumentation,
  uploadDocumentation,
} from "../lib/documentation-service";
import ProductImageGrid from "./ProductImageGrid";
import type { Documentation } from "../lib/documentation-service";

// Schema definitions - reused from ProductForm
const DocumentSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "File name is required"),
  file: z.any().optional(),
  file_url: z.string().optional(),
});

const ProductSchema = z.object({
  subheading: z.string(),
  heading: z.string(),
  short_description: z.string(),
  reference: z.string(),
  technical_file_url: z.string().url().optional(),
  size: z.array(z.string()),
  sectors: z.array(z.string()),
  long_description: z.string(),
  images: z.array(
    z.object({
      id: z.number().optional(),
      image_url: z.string().optional(),
      file: z.any().optional(),
      toDelete: z.boolean().optional(),
    })
  ),
  standards: z.string(),
  documentation: z.array(DocumentSchema),
  brand: z.string().optional(),
});

type ProductFormData = z.infer<typeof ProductSchema>;
type DocumentFile = z.infer<typeof DocumentSchema>;

// Rich Text Editor component - reused from ProductForm
const RichTextEditor = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none",
      },
    },
  });

  return (
    <div className="border border-input rounded-md overflow-hidden">
      <div className="bg-muted px-3 py-2 border-b border-input flex gap-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${
            editor?.isActive("bold") ? "bg-muted-foreground/20" : ""
          }`}
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${
            editor?.isActive("italic") ? "bg-muted-foreground/20" : ""
          }`}
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded ${
            editor?.isActive("underline") ? "bg-muted-foreground/20" : ""
          }`}
        >
          <span className="underline">U</span>
        </button>
        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-1 rounded ${
            editor?.isActive("heading", { level: 3 })
              ? "bg-muted-foreground/20"
              : ""
          }`}
        >
          <span className="font-bold">H3</span>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded ${
            editor?.isActive("bulletList") ? "bg-muted-foreground/20" : ""
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded ${
            editor?.isActive("orderedList") ? "bg-muted-foreground/20" : ""
          }`}
        >
          1. List
        </button>
      </div>
      <div className="bg-background">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
};

// Tag input component - reused from ProductForm
const TagInput = ({
  tags,
  setTags,
  placeholder,
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
}) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-input rounded-md px-3 py-2 bg-background">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1.5 text-primary hover:text-primary/70"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type and press Enter to add tags"}
        className="w-full border-0 p-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
};

// File Dropzone component - reused from ProductForm
const FileDropzone = ({
  file,
  onFileDrop,
  acceptedFileTypes,
  label = "Upload File",
  multiple = false,
}: {
  file?: File;
  onFileDrop: (files: File[]) => void;
  acceptedFileTypes?: Record<string, string[]>;
  label?: string;
  multiple?: boolean;
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles);
      }
    },
    [onFileDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple,
  });

  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">
        {label}
      </label>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-md p-4 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? "border-primary/70 bg-primary/5" : "border-input"}
          hover:border-primary/70 hover:bg-primary/5
        `}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="text-sm text-foreground flex flex-col items-center">
            <span className="text-primary font-medium">{file.name}</span>
            <span className="text-muted-foreground text-xs mt-1">
              {(file.size / 1024).toFixed(2)} KB
            </span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground flex flex-col items-center">
            <FiUpload className="mb-1 h-5 w-5" />
            <span>
              {isDragActive
                ? "Drop the file here"
                : `Drag & drop or click to browse${
                    multiple ? " (multiple files allowed)" : ""
                  }`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Documentation upload component - reused from ProductForm with modifications for editing
const DocumentationUploadField = ({
  doc,
  onDocChange,
  onFileChange,
  onRemove,
  showRemoveButton,
}: {
  doc: DocumentFile;
  onDocChange: (field: keyof DocumentFile, value: string) => void;
  onFileChange: (file: File) => void;
  onRemove: () => void;
  showRemoveButton: boolean;
}) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileDrop = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        // Check file size - limit to 50MB
        if (files[0].size > 50 * 1024 * 1024) {
          setFileError(
            `File ${files[0].name} is too large. Maximum size is 50MB.`
          );
          return;
        }
        onFileChange(files[0]);

        // Clear any previous error messages after successful upload
        if (fileError) {
          setFileError(null);
        }
      }
    },
    [onFileChange, fileError]
  );

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-md bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            File Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={doc.name}
              onChange={(e) => onDocChange("name", e.target.value)}
              className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="File Name"
            />
            {showRemoveButton && (
              <button
                type="button"
                onClick={onRemove}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-md"
                aria-label="Remove documentation"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        </div>

        <div>
          {!doc.file_url ? (
            <FileDropzone
              file={doc.file}
              onFileDrop={handleFileDrop}
              acceptedFileTypes={{
                "application/pdf": [".pdf"],
                "application/msword": [".doc"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
                "application/vnd.ms-excel": [".xls"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [".xlsx"],
              }}
              label="Upload File"
              multiple={false}
            />
          ) : (
            <div className="flex items-center space-x-2 mt-8">
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 flex items-center"
              >
                <FiFile className="mr-2" /> View Current File
              </a>
              <button
                type="button"
                onClick={() => onDocChange("file_url", "")}
                className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md"
              >
                Replace
              </button>
            </div>
          )}
        </div>
      </div>

      {fileError && (
        <div className="mt-1 text-destructive text-sm">{fileError}</div>
      )}

      {/* Show file preview if available */}
      {doc.file && (
        <div className="mt-2 flex items-center p-2 bg-primary/5 rounded-md">
          <FiFile className="text-primary mr-2" />
          <span className="text-sm text-gray-700 truncate flex-1">
            {doc.file.name} ({(doc.file.size / 1024).toFixed(1)} KB)
          </span>
        </div>
      )}
    </div>
  );
};

interface EditProductFormProps {
  productId: number;
  onBack: () => void;
  onSuccess?: () => void;
}

export default function EditProductForm({
  productId,
  onBack,
  onSuccess,
}: EditProductFormProps) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [originalDocs, setOriginalDocs] = useState<Documentation[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof ProductFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Available sizes
  const availableSizes = Array.from({ length: 10 }, (_, i) =>
    (i + 1).toString()
  );

  // Load product data when component mounts
  useEffect(() => {
    async function loadProductData() {
      try {
        setLoading(true);
        const productData = await getProductById(productId);
        const docsData = await getDocumentationByProductId(productId);

        if (!productData) {
          setSubmitError("Product not found");
          setLoading(false);
          return;
        }

        setOriginalDocs(docsData);

        // Initialize form data from the product
        const sizeArray = productData.size
          ? productData.size.split(",").map((s) => s.trim())
          : [];

        const sectorsArray =
          typeof productData.sectors === "string"
            ? JSON.parse(productData.sectors)
            : productData.sectors || [];

        setFormData({
          heading: productData.heading,
          subheading: productData.subheading,
          short_description: productData.short_description,
          reference: productData.reference,
          technical_file_url: productData.technical_file_url || "",
          size: sizeArray,
          sectors: sectorsArray,
          long_description: productData.long_description,
          standards: productData.standards || "",
          images: productData.images.map((img) => ({
            id: img.id,
            image_url: img.image_url,
            toDelete: false,
          })),
          documentation: docsData.map((doc) => ({
            id: doc.id,
            name: doc.name,
            file_url: doc.file_url,
          })),
          brand: productData.brand || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading product data:", error);
        setSubmitError("Failed to load product data");
        setLoading(false);
      }
    }

    loadProductData();
  }, [productId]);

  // Input handlers
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!formData) return;

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;

    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        size: [...formData.size, value],
      });
    } else {
      setFormData({
        ...formData,
        size: formData.size.filter((size) => size !== value),
      });
    }
  };

  const handleSectorsChange = (newSectors: string[]) => {
    if (!formData) return;

    setFormData({
      ...formData,
      sectors: newSectors,
    });
  };

  const handleRichTextChange = (
    field: "long_description" | "standards",
    value: string
  ) => {
    if (!formData) return;

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Image handlers
  const handleImageDrop = useCallback(
    (files: File[]) => {
      if (!formData) return;

      // Check file sizes and types
      const validFiles = files.filter((file) => {
        // Check if the file is an image (under 50MB)
        if (file.size > 50 * 1024 * 1024) {
          setSubmitError(
            `File ${file.name} is too large. Maximum size is 50MB.`
          );
          return false;
        }

        // Check if the file is an image type
        if (!file.type.startsWith("image/")) {
          setSubmitError(`File ${file.name} is not an image.`);
          return false;
        }

        return true;
      });

      // Add valid files to the form data
      if (validFiles.length > 0) {
        const newImages = validFiles.map((file) => ({ file }));
        setFormData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            images: [...prev.images, ...newImages],
          };
        });

        // Clear any previous error messages after successful upload
        if (submitError && submitError.includes("file")) {
          setSubmitError(null);
        }
      }
    },
    [formData, submitError]
  );

  const removeImage = (index: number) => {
    if (!formData) return;

    const imageToRemove = formData.images[index];

    // If this image has an ID (exists in database), mark it for deletion
    if (imageToRemove.id) {
      setImagesToDelete((prev) => [...prev, imageToRemove.id as number]);
    }

    // Remove from current UI
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  // Documentation handlers
  const addDocumentationField = () => {
    if (!formData) return;

    setFormData({
      ...formData,
      documentation: [...formData.documentation, { name: "", file: undefined }],
    });
  };

  const handleDocumentationChange = (
    index: number,
    field: keyof DocumentFile,
    value: string
  ) => {
    if (!formData) return;

    const updatedDocs = [...formData.documentation];
    updatedDocs[index] = { ...updatedDocs[index], [field]: value };
    setFormData({
      ...formData,
      documentation: updatedDocs,
    });
  };

  const handleDocumentationFileChange = (index: number, file: File) => {
    if (!formData) return;

    const updatedDocs = [...formData.documentation];
    updatedDocs[index] = {
      ...updatedDocs[index],
      file,
      name: updatedDocs[index].name || file.name,
      file_url: undefined, // Clear the file_url as we're replacing it
    };
    setFormData({
      ...formData,
      documentation: updatedDocs,
    });
  };

  const removeDocumentationField = (index: number) => {
    if (!formData) return;

    const updatedDocs = [...formData.documentation];

    // If this doc has an ID (exists in database), handle deletion
    const docToRemove = updatedDocs[index];
    if (docToRemove.id) {
      // Will be deleted when form is submitted
    }

    updatedDocs.splice(index, 1);
    setFormData({
      ...formData,
      documentation: updatedDocs.length
        ? updatedDocs
        : [{ name: "", file: undefined }],
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      // Validate the form data with Zod
      const validatedData = ProductSchema.parse(formData);

      // Prepare product data for submission
      const productData = {
        heading: validatedData.heading,
        subheading: validatedData.subheading,
        short_description: validatedData.short_description,
        reference: validatedData.reference,
        technical_file_url: validatedData.technical_file_url || "",
        size: validatedData.size.join(", "), // Convert array to comma-separated string
        sectors: validatedData.sectors, // This is already an array and will be stored as JSON
        long_description: validatedData.long_description,
        standards: validatedData.standards,
        brand: validatedData.brand || "",
      };

      // Get new image files to add
      const newImageFiles = formData.images
        .filter((img) => img.file)
        .map((img) => img.file)
        .filter((file): file is File => file !== undefined);

      // Update the product with new data and images
      const success = await updateProduct(
        productId,
        productData,
        newImageFiles,
        imagesToDelete
      );

      // Handle documents that need to be deleted
      const docsToDelete = originalDocs
        .filter(
          (originalDoc) =>
            !formData.documentation.some(
              (currentDoc) => currentDoc.id === originalDoc.id
            )
        )
        .map((doc) => doc.id as number);

      // Delete documents that were removed
      for (const docId of docsToDelete) {
        await deleteDocumentation(docId);
      }

      // Handle new documentation files
      const newDocs = formData.documentation
        .filter((doc) => !doc.id && doc.name.trim() !== "" && doc.file)
        .map((doc) => ({
          name: doc.name,
          file: doc.file as File,
        }));

      if (newDocs.length > 0) {
        await uploadDocumentation(productId, newDocs);
      }

      if (success) {
        setSubmitSuccess(true);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        setSubmitError("Failed to update product. Please try again.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a more usable format
        const errors: Partial<Record<keyof ProductFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          errors[path as keyof ProductFormData] = err.message;
        });
        setValidationErrors(errors);
        setSubmitError("Please fix the validation errors and try again.");
      } else {
        console.error("Submission failed:", error);
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-transparent border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to Products
      </button>

      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Information Section */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Product Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subheading */}
            <div className="space-y-2">
              <label
                htmlFor="subheading"
                className="text-sm font-medium text-foreground"
              >
                Subheading
              </label>
              <input
                type="text"
                id="subheading"
                name="subheading"
                value={formData.subheading}
                onChange={handleTextChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {validationErrors.subheading && (
                <p className="text-destructive text-sm">
                  {validationErrors.subheading}
                </p>
              )}
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <label
                htmlFor="heading"
                className="text-sm font-medium text-foreground"
              >
                Heading
              </label>
              <input
                type="text"
                id="heading"
                name="heading"
                value={formData.heading}
                onChange={handleTextChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {validationErrors.heading && (
                <p className="text-destructive text-sm">
                  {validationErrors.heading}
                </p>
              )}
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <label
                htmlFor="reference"
                className="text-sm font-medium text-foreground"
              >
                Reference
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleTextChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {validationErrors.reference && (
                <p className="text-destructive text-sm">
                  {validationErrors.reference}
                </p>
              )}
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <label
                htmlFor="brand"
                className="text-sm font-medium text-foreground"
              >
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleTextChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {validationErrors.brand && (
                <p className="text-destructive text-sm">
                  {validationErrors.brand}
                </p>
              )}
            </div>

            {/* Technical File URL */}
            <div className="space-y-2">
              <label
                htmlFor="technical_file_url"
                className="text-sm font-medium text-foreground"
              >
                Technical File URL
              </label>
              <input
                type="url"
                id="technical_file_url"
                name="technical_file_url"
                value={formData.technical_file_url}
                onChange={handleTextChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {validationErrors.technical_file_url && (
                <p className="text-destructive text-sm">
                  {validationErrors.technical_file_url}
                </p>
              )}
            </div>

            {/* Short Description - Full width */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label
                htmlFor="short_description"
                className="text-sm font-medium text-foreground"
              >
                Short Description
              </label>
              <textarea
                id="short_description"
                name="short_description"
                rows={3}
                value={formData.short_description}
                onChange={handleTextChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {validationErrors.short_description && (
                <p className="text-destructive text-sm">
                  {validationErrors.short_description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Size and Sectors
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Size */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground block">
                Size
              </label>
              <div className="grid grid-cols-5 gap-2">
                {availableSizes.map((size) => (
                  <div key={size} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`size-${size}`}
                      value={size}
                      checked={formData.size.includes(size)}
                      onChange={handleSizeChange}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`size-${size}`}
                      className="ml-2 text-sm text-foreground"
                    >
                      {size}
                    </label>
                  </div>
                ))}
              </div>
              {validationErrors.size && (
                <p className="text-destructive text-sm">
                  {validationErrors.size}
                </p>
              )}
            </div>

            {/* Sectors */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground block">
                Sectors
              </label>
              <TagInput
                tags={formData.sectors}
                setTags={handleSectorsChange}
                placeholder="Type sector name and press Enter"
              />
              {validationErrors.sectors && (
                <p className="text-destructive text-sm">
                  {validationErrors.sectors}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Information Section */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Detailed Information
          </h3>

          <div className="space-y-6">
            {/* Long Description */}
            <div className="space-y-2">
              <label
                htmlFor="long_description"
                className="text-sm font-medium text-foreground"
              >
                Long Description (Rich Text)
              </label>
              <RichTextEditor
                value={formData.long_description}
                onChange={(value) =>
                  handleRichTextChange("long_description", value)
                }
                placeholder="Enter detailed product description here..."
              />
              {validationErrors.long_description && (
                <p className="text-destructive text-sm">
                  {validationErrors.long_description}
                </p>
              )}
            </div>

            {/* Standards */}
            <div className="space-y-2">
              <label
                htmlFor="standards"
                className="text-sm font-medium text-foreground"
              >
                Standards (Rich Text)
              </label>
              <RichTextEditor
                value={formData.standards}
                onChange={(value) => handleRichTextChange("standards", value)}
                placeholder="Enter standards information here..."
              />
              {validationErrors.standards && (
                <p className="text-destructive text-sm">
                  {validationErrors.standards}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Product Images
          </h3>

          <div className="space-y-4">
            {/* Single Dropzone for new images */}
            <FileDropzone
              file={undefined}
              onFileDrop={handleImageDrop}
              acceptedFileTypes={{
                "image/*": [".jpeg", ".jpg", ".png", ".gif"],
              }}
              label="Drop new images here or click to browse"
              multiple={true}
            />

            {/* Image Grid - display both existing and new images */}
            <ProductImageGrid
              images={formData.images.map((img) => ({
                id: img.id,
                file: img.file,
                image_url: img.image_url,
              }))}
              isUploading={isSubmitting}
              onRemoveImage={removeImage}
            />

            {validationErrors.images && (
              <p className="text-destructive text-sm">
                {validationErrors.images}
              </p>
            )}
          </div>
        </div>

        {/* Documentation Section */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-foreground">
              Documentation
            </h3>
            <button
              type="button"
              onClick={addDocumentationField}
              className="flex items-center px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <FiPlus className="mr-1" /> Add Documentation
            </button>
          </div>

          <div className="space-y-6">
            {formData.documentation.map((doc, index) => (
              <DocumentationUploadField
                key={index}
                doc={doc}
                onDocChange={(field, value) =>
                  handleDocumentationChange(index, field, value)
                }
                onFileChange={(file) =>
                  handleDocumentationFileChange(index, file)
                }
                onRemove={() => removeDocumentationField(index)}
                showRemoveButton={formData.documentation.length > 1}
              />
            ))}
            {validationErrors.documentation && (
              <p className="text-destructive text-sm">
                {validationErrors.documentation}
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Updating...</span>
                <div className="h-4 w-4 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin"></div>
              </>
            ) : (
              "Update Product"
            )}
          </button>
        </div>

        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
            Product successfully updated!
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {submitError}
          </div>
        )}
      </form>
    </div>
  );
}
