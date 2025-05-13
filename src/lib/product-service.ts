import supabase from "../supabase-client";
import { uploadFile, deleteFile } from "./supabase-storage";
import { uploadDocumentation } from "./documentation-service";

// Define types based on your database schema
export interface Product {
  id?: number;
  created_at?: string;
  heading: string;
  subheading: string;
  short_description: string;
  reference: string;
  technical_file_url?: string;
  size: string;
  sectors: string[];
  long_description: string;
  standards?: string;
}

export interface ProductImage {
  id?: number;
  created_at?: string;
  image_url: string;
  product: number;
}

/**
 * Create a new product with images and documentation
 */
export async function createProduct(
  product: Omit<Product, "id" | "created_at">,
  imageFiles: File[],
  documentations: Array<{ name: string; file: File }> = []
): Promise<number | null> {
  try {
    // 1. Insert the product data
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert({
        heading: product.heading,
        subheading: product.subheading,
        short_description: product.short_description,
        reference: product.reference,
        technical_file_url: product.technical_file_url,
        size: product.size,
        sectors: product.sectors,
        long_description: product.long_description,
        standards: product.standards,
      })
      .select("id")
      .single();

    if (productError) {
      console.error("Error creating product:", productError.message);
      return null;
    }

    const productId = productData.id;

    // 2. Upload images to storage and create image records
    if (imageFiles.length > 0) {
      // Upload each file to Supabase storage (in root folder)
      const imageUploadPromises = imageFiles.map((file) =>
        uploadFile(file, "product-images")
      );

      const imageUrls = await Promise.all(imageUploadPromises);
      const validImageUrls = imageUrls.filter(
        (url): url is string => url !== null
      );

      if (validImageUrls.length > 0) {
        // Create image records in the database
        // Each record links to the product via 'product' field
        const imageRecords = validImageUrls.map((url) => ({
          image_url: url,
          product: productId,
        }));

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imageRecords);

        if (imagesError) {
          console.error("Error saving image records:", imagesError.message);
        }
      }
    }

    // 3. Upload documentation files
    if (documentations.length > 0) {
      const docsUploaded = await uploadDocumentation(productId, documentations);
      if (!docsUploaded) {
        console.error("Some documentation files failed to upload");
      }
    }

    return productId;
  } catch (error) {
    console.error("Error in createProduct:", error);
    return null;
  }
}

/**
 * Get a product by ID, including its images
 */
export async function getProductById(
  id: number
): Promise<(Product & { images: ProductImage[] }) | null> {
  try {
    // Get the product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (productError) {
      console.error("Error fetching product:", productError.message);
      return null;
    }

    // Get the product images using the foreign key relationship
    const { data: images, error: imagesError } = await supabase
      .from("product_images")
      .select("*")
      .eq("product", id);

    if (imagesError) {
      console.error("Error fetching product images:", imagesError.message);
      return { ...product, images: [] };
    }

    return { ...product, images: images || [] };
  } catch (error) {
    console.error("Error in getProductById:", error);
    return null;
  }
}

/**
 * Get all products with their first image
 */
export async function getAllProducts(): Promise<
  (Product & { primary_image?: string })[]
> {
  try {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("Error fetching products:", productsError.message);
      return [];
    }

    // For each product, get its first image
    const productsWithImage = await Promise.all(
      products.map(async (product) => {
        const { data: images, error: imagesError } = await supabase
          .from("product_images")
          .select("image_url")
          .eq("product", product.id)
          .limit(1);

        if (imagesError || !images || images.length === 0) {
          return { ...product, primary_image: undefined };
        }

        return { ...product, primary_image: images[0].image_url };
      })
    );

    return productsWithImage;
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return [];
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: number,
  product: Partial<Omit<Product, "id" | "created_at">>,
  newImageFiles?: File[],
  deleteImageIds?: number[]
): Promise<boolean> {
  try {
    // 1. Update the product data
    const { error: productError } = await supabase
      .from("products")
      .update(product)
      .eq("id", id);

    if (productError) {
      console.error("Error updating product:", productError.message);
      return false;
    }

    // 2. Handle image deletions if needed
    if (deleteImageIds && deleteImageIds.length > 0) {
      // Get the image URLs before deletion (for storage cleanup)
      const { data: imagesToDelete } = await supabase
        .from("product_images")
        .select("id, image_url")
        .in("id", deleteImageIds);

      // Delete the image records
      const { error: deleteError } = await supabase
        .from("product_images")
        .delete()
        .in("id", deleteImageIds);

      if (deleteError) {
        console.error("Error deleting images:", deleteError.message);
      } else if (imagesToDelete) {
        // Delete the files from storage
        imagesToDelete.forEach((img) => {
          if (img.image_url) {
            deleteFile(img.image_url, "product-images");
          }
        });
      }
    }

    // 3. Handle new image uploads if needed
    if (newImageFiles && newImageFiles.length > 0) {
      await addProductImages(id, newImageFiles);
    }

    return true;
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return false;
  }
}

/**
 * Delete a product and its images
 */
export async function deleteProduct(id: number): Promise<boolean> {
  try {
    // 1. Get all product images before deletion
    const { data: productImages, error: imagesError } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product", id);

    if (imagesError) {
      console.error(
        "Error fetching product images before deletion:",
        imagesError.message
      );
      // Continue with deletion even if we can't get the images
    }

    // 2. Get all product documentation before deletion
    const { data: documentation, error: docsError } = await supabase
      .from("documentation")
      .select("file_url")
      .eq("product", id);

    if (docsError) {
      console.error(
        "Error fetching documentation before deletion:",
        docsError.message
      );
      // Continue with deletion even if we can't get the documentation
    }

    // 3. Delete the product (this will cascade delete related records in the database)
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error.message);
      return false;
    }

    // 4. Clean up files from storage

    // 4.1 Delete all product images
    if (productImages && productImages.length > 0) {
      for (const img of productImages) {
        if (img.image_url) {
          await deleteFile(img.image_url, "product-images");
        }
      }
    }

    // 4.2 Delete all documentation files
    if (documentation && documentation.length > 0) {
      for (const doc of documentation) {
        if (doc.file_url) {
          await deleteFile(doc.file_url, "documentation");
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return false;
  }
}

/**
 * Delete product image by ID
 */
export async function deleteProductImage(imageId: number): Promise<boolean> {
  try {
    // First get the image URL so we can delete the file from storage
    const { data: image, error: fetchError } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("id", imageId)
      .single();

    if (fetchError) {
      console.error("Error fetching image to delete:", fetchError.message);
      return false;
    }

    // Delete the image record from the database
    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      console.error("Error deleting image record:", deleteError.message);
      return false;
    }

    // Delete the file from storage
    if (image && image.image_url) {
      await deleteFile(image.image_url, "product-images");
    }

    return true;
  } catch (error) {
    console.error("Error in deleteProductImage:", error);
    return false;
  }
}

/**
 * Add new images to an existing product
 */
export async function addProductImages(
  productId: number,
  imageFiles: File[]
): Promise<boolean> {
  try {
    if (imageFiles.length === 0) return true;

    // Upload each file to Supabase storage (in root folder)
    const imageUploadPromises = imageFiles.map((file) =>
      uploadFile(file, "product-images")
    );

    const imageUrls = await Promise.all(imageUploadPromises);
    const validImageUrls = imageUrls.filter(
      (url): url is string => url !== null
    );

    if (validImageUrls.length === 0) {
      console.error("No valid image URLs were generated");
      return false;
    }

    // Create image records in the database
    const imageRecords = validImageUrls.map((url) => ({
      image_url: url,
      product: productId,
    }));

    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imageRecords);

    if (imagesError) {
      console.error("Error saving image records:", imagesError.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in addProductImages:", error);
    return false;
  }
}
