import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { StorageDriver } from '@config/storage.config';

export interface UploadOptions {
  folder?: string;
  contentType?: string;
  fileName?: string;
  isPublic?: boolean;
}

export interface UploadResult {
  key: string;
  url: string;
  bucket?: string;
  driver: StorageDriver;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: StorageDriver;

  // Local storage
  private readonly localPath: string;
  private readonly localServeUrl: string;
  private readonly baseUrl: string;

  // S3 storage
  private s3Client?: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnUrl?: string;

  constructor(private readonly configService: ConfigService) {
    this.driver = this.configService.get<StorageDriver>(
      'storage.driver',
      'local',
    );

    // Local config
    this.localPath = this.configService.get<string>(
      'storage.localPath',
      './uploads',
    );
    this.localServeUrl = this.configService.get<string>(
      'storage.localServeUrl',
      '/uploads',
    );
    const port = this.configService.get<number>('app.port', 3000);
    const apiPrefix = this.configService.get<string>('app.apiPrefix', 'api/v1');
    this.baseUrl = this.configService
      .get<string>('app.frontendUrl', `http://localhost:${port}`)
      .replace('/api/v1', '')
      .replace(`/${apiPrefix}`, '');

    // S3 config
    this.region = this.configService.get<string>(
      'storage.awsRegion',
      'ap-southeast-1',
    );
    this.bucket = this.configService.get<string>('storage.s3Bucket', '');
    this.cdnUrl = this.configService.get<string>('storage.cdnUrl');

    if (this.driver === 's3') {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.configService.get<string>(
            'storage.awsAccessKeyId',
            '',
          ),
          secretAccessKey: this.configService.get<string>(
            'storage.awsSecretAccessKey',
            '',
          ),
        },
      });
    }

    this.logger.log(`Storage driver: ${this.driver}`);
  }

  async onModuleInit(): Promise<void> {
    if (this.driver === 'local') {
      await this.ensureLocalDirectories();
    }
  }

  private async ensureLocalDirectories(): Promise<void> {
    const folders = ['images', 'videos', 'files', 'avatars', 'submissions'];
    for (const folder of folders) {
      const dirPath = path.join(this.localPath, folder);
      try {
        await fs.mkdir(dirPath, { recursive: true });
      } catch (error) {
        this.logger.warn(`Could not create directory ${dirPath}: ${error}`);
      }
    }
    this.logger.log(`Local storage directories ensured at: ${this.localPath}`);
  }

  /**
   * Upload a file (auto-selects driver)
   */
  async upload(
    buffer: Buffer,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    if (this.driver === 'local') {
      return this.uploadLocal(buffer, options);
    }
    return this.uploadS3(buffer, options);
  }

  /**
   * Upload to local filesystem
   */
  private async uploadLocal(
    buffer: Buffer,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const {
      folder = 'uploads',
      contentType = 'application/octet-stream',
      fileName,
    } = options;

    const extension = this.getExtension(contentType);
    const uniqueName = `${uuidv4()}${fileName ? `-${this.sanitizeFileName(fileName)}` : ''}${extension}`;
    const key = `${folder}/${uniqueName}`;
    const filePath = path.join(this.localPath, key);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write file
    await fs.writeFile(filePath, buffer);

    const url = `${this.baseUrl}${this.localServeUrl}/${key}`;

    this.logger.log(`File uploaded locally: ${key}`);

    return {
      key,
      url,
      driver: 'local',
    };
  }

  /**
   * Upload to S3
   */
  private async uploadS3(
    buffer: Buffer,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    if (!this.s3Client) {
      throw new Error('S3 client not configured');
    }

    const {
      folder = 'uploads',
      contentType = 'application/octet-stream',
      fileName,
    } = options;

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

    this.logger.log(`File uploaded to S3: ${key}`);

    return {
      key,
      url,
      bucket: this.bucket,
      driver: 's3',
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
   * Upload an avatar
   */
  async uploadAvatar(
    buffer: Buffer,
    contentType: string,
    fileName?: string,
  ): Promise<UploadResult> {
    return this.upload(buffer, {
      folder: 'avatars',
      contentType,
      fileName,
      isPublic: true,
    });
  }

  /**
   * Upload a submission file
   */
  async uploadSubmission(
    buffer: Buffer,
    contentType: string,
    fileName?: string,
  ): Promise<UploadResult> {
    return this.upload(buffer, {
      folder: 'submissions',
      contentType,
      fileName,
      isPublic: false,
    });
  }

  /**
   * Get a signed URL for private file access (S3 only)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.driver === 'local') {
      // For local, just return the public URL
      return `${this.baseUrl}${this.localServeUrl}/${key}`;
    }

    if (!this.s3Client) {
      throw new Error('S3 client not configured');
    }

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
    if (this.driver === 'local') {
      return `${this.baseUrl}${this.localServeUrl}/${key}`;
    }

    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Delete a file
   */
  async delete(key: string): Promise<void> {
    if (this.driver === 'local') {
      return this.deleteLocal(key);
    }
    return this.deleteS3(key);
  }

  private async deleteLocal(key: string): Promise<void> {
    const filePath = path.join(this.localPath, key);
    try {
      await fs.unlink(filePath);
      this.logger.log(`File deleted locally: ${key}`);
    } catch (error) {
      this.logger.warn(`Could not delete file ${key}: ${error}`);
    }
  }

  private async deleteS3(key: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not configured');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
    this.logger.log(`File deleted from S3: ${key}`);
  }

  /**
   * Check if storage is configured
   */
  isConfigured(): boolean {
    if (this.driver === 'local') {
      return true;
    }
    return !!(
      this.bucket &&
      this.configService.get<string>('storage.awsAccessKeyId') &&
      this.configService.get<string>('storage.awsSecretAccessKey')
    );
  }

  /**
   * Get current storage driver
   */
  getDriver(): StorageDriver {
    return this.driver;
  }

  /**
   * Get local upload path (for static serving)
   */
  getLocalPath(): string {
    return this.localPath;
  }

  /**
   * Get local serve URL prefix
   */
  getLocalServeUrl(): string {
    return this.localServeUrl;
  }

  private getExtension(contentType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mov',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        '.xlsx',
      'text/plain': '.txt',
      'application/zip': '.zip',
      'application/x-rar-compressed': '.rar',
    };

    return mimeToExt[contentType] || '';
  }

  private sanitizeFileName(fileName: string): string {
    // Remove extension first
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    return nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }
}
