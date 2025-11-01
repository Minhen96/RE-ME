import { supabase } from './supabaseClient';

/**
 * Get the public URL for a file stored in Supabase Storage
 * @param bucketName - The name of the storage bucket (e.g., 'moment-images', 'activity-images')
 * @param path - The file path in the bucket (e.g., 'userId/filename.jpg')
 * @returns The public URL to access the file
 */
export function getStorageUrl(bucketName: string, path: string | null | undefined): string | null {
  if (!path) return null;

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Get the public URL for a moment image
 */
export function getMomentImageUrl(imagePath: string | null | undefined): string | null {
  return getStorageUrl('moment-images', imagePath);
}

/**
 * Get the public URL for an activity image
 */
export function getActivityImageUrl(imagePath: string | null | undefined): string | null {
  return getStorageUrl('activity-images', imagePath);
}
