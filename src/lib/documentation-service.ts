import supabase from "../supabase-client";
import { uploadFile, deleteFile } from "./supabase-storage";

export interface Documentation {
  id?: number;
  created_at?: string;
  name: string;
  file_url?: string;
  product: number;
}

/**
 * Upload documentation files and save their records
 */
export async function uploadDocumentation(
  productId: number,
  documentations: Array<{ name: string; file: File }>
): Promise<boolean> {
  try {
    if (!documentations.length) return true;

    // Process each documentation file
    const documentationPromises = documentations.map(async (doc) => {
      // Upload file to storage
      const fileUrl = await uploadFile(doc.file, "documentation");

      if (!fileUrl) {
        console.error(`Failed to upload documentation file: ${doc.name}`);
        return null;
      }

      // Create database record
      const { error } = await supabase.from("documentation").insert({
        name: doc.name,
        file_url: fileUrl,
        product: productId,
      });

      if (error) {
        console.error("Error saving documentation record:", error.message);
        return null;
      }

      return { name: doc.name, file_url: fileUrl };
    });

    const results = await Promise.all(documentationPromises);
    // Check if any uploads failed
    return results.every((result) => result !== null);
  } catch (error) {
    console.error("Error in uploadDocumentation:", error);
    return false;
  }
}

/**
 * Get documentation files for a product
 */
export async function getDocumentationByProductId(
  productId: number
): Promise<Documentation[]> {
  try {
    const { data, error } = await supabase
      .from("documentation")
      .select("*")
      .eq("product", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documentation:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getDocumentationByProductId:", error);
    return [];
  }
}

/**
 * Delete a documentation file
 */
export async function deleteDocumentation(docId: number): Promise<boolean> {
  try {
    // First get the file URL
    const { data, error: fetchError } = await supabase
      .from("documentation")
      .select("file_url")
      .eq("id", docId)
      .single();

    if (fetchError) {
      console.error(
        "Error fetching documentation to delete:",
        fetchError.message
      );
      return false;
    }

    // Delete the record from the database
    const { error: deleteError } = await supabase
      .from("documentation")
      .delete()
      .eq("id", docId);

    if (deleteError) {
      console.error(
        "Error deleting documentation record:",
        deleteError.message
      );
      return false;
    }

    // Delete the file from storage
    if (data && data.file_url) {
      await deleteFile(data.file_url, "documentation");
    }

    return true;
  } catch (error) {
    console.error("Error in deleteDocumentation:", error);
    return false;
  }
}
