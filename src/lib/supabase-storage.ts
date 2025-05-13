import supabase from "../supabase-client";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket to upload to
 * @returns The URL of the uploaded file or null if upload failed
 */
export async function uploadFile(
  file: File,
  bucket: string
): Promise<string | null> {
  try {
    // Create a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    // Upload file to Supabase - directly to the bucket's root
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error.message);
      return null;
    }

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in file upload:", error);
    return null;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param fileUrl The full URL of the file to delete
 * @param bucket The storage bucket where the file is stored
 * @returns Boolean indicating if deletion was successful
 */
export async function deleteFile(
  fileUrl: string,
  bucket: string
): Promise<boolean> {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split("/");
    const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join("/");

    // Delete the file
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in file deletion:", error);
    return false;
  }
}
