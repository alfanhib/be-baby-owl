import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  folder?: string;
  contentType?: string;
  fileName?: string;
  isPublic?: boolean;
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnUrl?: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'ap-southeast-1');
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', '');
    this.cdnUrl = this.configService.get<string>('CDN_URL');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  /**
   * Upload a file to S3
   */
  async upload(
    buffer: Buffer,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const { folder = 'uploads', contentType = 'application/octet-stream', fileName } = options;

    const extension = this.getExtension(contentType);
    const key = `${folder}/${uuidv4()}${fileName ? `-${this.sanitizeFileName(fileName)}` : ''}${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: options.isPublic ? 'public-read' : 'private',
    });

    await this.s3Client.send(command);

    const url = options.isPublic
      ? this.getPublicUrl(key)
      : await this.getSignedUrl(key);

    this.logger.log(`File uploaded: ${key}`);

    return {
      key,
      url,
      bucket: this.bucket,
    };
  }

  /**
   * Upload an image
   */
  async uploadImage(
    buffer: Buffer,
    contentType: string,
    fileName?: string,
  ): Promise<UploadResult> {
    return this.upload(buffer, {
      folder: 'images',
      contentType,
      fileName,
      isPublic: true,
    });
  }

  /**
   * Upload a video
   */
  async uploadVideo(
    buffer: Buffer,
    contentType: string,
    fileName?: string,
  ): Promise<UploadResult> {
    return this.upload(buffer, {
      folder: 'videos',
      contentType,
      fileName,
      isPublic: false,
    });
  }

  /**
   * Upload a file/document
   */
  async uploadFile(
    buffer: Buffer,
    contentType: string,
    fileName?: string,
  ): Promise<UploadResult> {
    return this.upload(buffer, {
      folder: 'files',
      contentType,
      fileName,
      isPublic: false,
    });
  }

  /**
   * Get a signed URL for private file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Delete a file from S3
   */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
    this.logger.log(`File deleted: ${key}`);
  }

  /**
   * Check if storage is configured
   */
  isConfigured(): boolean {
    return !!(
      this.bucket &&
      this.configService.get<string>('AWS_ACCESS_KEY_ID') &&
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY')
    );
  }

  private getExtension(contentType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    };

    return mimeToExt[contentType] || '';
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }
}

