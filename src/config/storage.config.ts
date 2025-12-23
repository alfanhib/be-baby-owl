import { registerAs } from '@nestjs/config';

export type StorageDriver = 'local' | 's3';

export const storageConfig = registerAs('storage', () => ({
  driver: (process.env.STORAGE_DRIVER || 'local') as StorageDriver,
  // Local storage config
  localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
  localServeUrl: process.env.STORAGE_LOCAL_SERVE_URL || '/uploads',
  // AWS S3 config
  awsRegion: process.env.AWS_REGION || 'ap-southeast-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3Bucket: process.env.AWS_S3_BUCKET || 'inntexia-uploads',
  cdnUrl: process.env.CDN_URL,
}));

export type StorageConfig = ReturnType<typeof storageConfig>;
