import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { StorageService, UploadResult } from '../../infrastructure/storage/storage.service';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post('image')
  @Roles('instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: UploadResult }> {
    this.validateFile(file);
    this.validateImageType(file);

    const result = await this.storageService.uploadImage(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    return { success: true, data: result };
  }

  @Post('file')
  @Roles('instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file/document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: UploadResult }> {
    this.validateFile(file);
    this.validateDocumentType(file);

    const result = await this.storageService.uploadFile(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    return { success: true, data: result };
  }

  @Post('video')
  @Roles('instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Video uploaded successfully' })
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: boolean; data: UploadResult }> {
    this.validateFile(file);
    this.validateVideoType(file);

    const result = await this.storageService.uploadVideo(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    return { success: true, data: result };
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
  }

  private validateImageType(file: Express.Multer.File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image type. Allowed: ${allowedTypes.join(', ')}`,
      );
    }

    // Max 10MB for images
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Image size must be less than 10MB');
    }
  }

  private validateDocumentType(file: Express.Multer.File): void {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: PDF, DOC, DOCX, TXT, ZIP`,
      );
    }

    // Max 50MB for documents
    if (file.size > 50 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 50MB');
    }
  }

  private validateVideoType(file: Express.Multer.File): void {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid video type. Allowed: MP4, WebM, MOV`,
      );
    }

    // Max 500MB for videos
    if (file.size > 500 * 1024 * 1024) {
      throw new BadRequestException('Video size must be less than 500MB');
    }
  }
}

