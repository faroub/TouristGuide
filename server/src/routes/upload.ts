import { FastifyInstance } from 'fastify';
import { uploadImageToStorage } from '../services/storage.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadRoutes(app: FastifyInstance) {
  // POST /api/v1/places/upload-image
  app.post('/api/v1/places/upload-image', async (request, reply) => {
    try {
      const data = await request.file({
        limits: {
          fileSize: MAX_FILE_SIZE_BYTES,
        },
      });

      if (!data) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'No image file payload provided in multipart form data.',
        });
      }

      // 1. Mime-Type Validation
      if (!ALLOWED_MIME_TYPES.has(data.mimetype)) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: `Invalid file type '${data.mimetype}'. Allowed mime-types: image/jpeg, image/png, image/webp.`,
        });
      }

      // 2. Read file stream into buffer
      const buffer = await data.toBuffer();

      // 3. File Size Validation (Check buffer size)
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return reply.status(413).send({
          error: 'Payload Too Large',
          message: `File size exceeds maximum constraint of 5MB. Uploaded size: ${(
            buffer.length /
            (1024 * 1024)
          ).toFixed(2)}MB.`,
        });
      }

      // 4. Upload to Cloud Object Storage
      const imageUrl = await uploadImageToStorage({
        buffer,
        mimeType: data.mimetype,
        originalName: data.filename,
      });

      return reply.status(201).send({
        imageUrl,
      });
    } catch (error: any) {
      if (error?.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.status(413).send({
          error: 'Payload Too Large',
          message: 'File size exceeds maximum allowed limit of 5MB.',
        });
      }

      app.log.error('Image upload route failure:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to process and upload image.',
      });
    }
  });
}
