import { randomUUID } from 'crypto';
import path from 'path';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME } from '@/config/r2';

function buildKey(folder: string, originalName: string) {
  const ext = path.extname(originalName);
  return `${folder}/${randomUUID()}${ext}`;
}

export const uploadsService = {
  async uploadFile(buffer: Buffer, contentType: string, folder: string, originalName: string) {
    const key = buildKey(folder, originalName);
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return { key };
  },

  getSignedUrl(key: string, expiresInSeconds = 3600) {
    return getSignedUrl(r2Client, new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  },

  async deleteFile(key: string) {
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
  },
};
