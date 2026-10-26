import crypto from 'node:crypto';
import path from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const S3_BUCKET = process.env.S3_BUCKET_NAME || 'tourist-guide-uploads';
const S3_REGION = process.env.AWS_REGION || 'us-east-1';
const CDN_BASE_URL =
  process.env.STORAGE_CDN_URL || `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

// Initialize S3 / Supabase Storage S3-compatible Client
const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: process.env.STORAGE_ENDPOINT, // Custom endpoint for Supabase/MinIO
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
  forcePathStyle: !!process.env.STORAGE_ENDPOINT,
});

export interface UploadOptions {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export async function uploadImageToStorage(options: UploadOptions): Promise<string> {
  const { buffer, mimeType, originalName } = options;

  // Extract extension or default to .jpg
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  // Generate collision-resistant UUID filename
  const filename = `ugc-places/${crypto.randomUUID()}${ext}`;

  // If AWS S3 credentials exist, stream to Cloud Object Storage
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      });

      await s3Client.send(command);
      const publicUrl = `${CDN_BASE_URL}/${filename}`;
      console.log(`☁️ Uploaded image to cloud object storage: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('S3 Storage upload failed:', error);
      throw new Error('Cloud storage upload failed. Please try again.');
    }
  }

  // Fallback CDN mock URL generation for local dev testing
  const fallbackUrl = `https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&ref=${crypto.randomUUID()}`;
  console.log(`📦 Development mode upload simulated: ${fallbackUrl}`);
  return fallbackUrl;
}
