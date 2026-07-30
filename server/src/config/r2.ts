import { S3Client } from '@aws-sdk/client-s3';

// Cloudflare R2 is S3-compatible, so the AWS SDK works against it via a
// custom endpoint — 'auto' region is what R2 expects regardless of the
// bucket's actual location.
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? 'hrm-uploads';
