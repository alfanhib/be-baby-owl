import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  awsRegion: process.env.AWS_REGION || 'ap-southeast-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3Bucket: process.env.S3_BUCKET || 'inntexia-uploads',
}));

export type StorageConfig = ReturnType<typeof storageConfig>;
