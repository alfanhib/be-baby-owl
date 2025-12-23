import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');
  const port = appConfig?.port ?? 3000;
  const apiPrefix = appConfig?.apiPrefix ?? 'api/v1';

  // Security
  app.use(helmet());

  // CORS - Allow all origins in development
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Static file serving for local uploads
  const storageDriver = configService.get<string>('storage.driver', 'local');
  if (storageDriver === 'local') {
    const localPath = configService.get<string>(
      'storage.localPath',
      './uploads',
    );
    const localServeUrl = configService.get<string>(
      'storage.localServeUrl',
      '/uploads',
    );
    const absolutePath = path.isAbsolute(localPath)
      ? localPath
      : path.join(process.cwd(), localPath);
    app.useStaticAssets(absolutePath, { prefix: localServeUrl });
    console.log(
      `Static files served from: ${absolutePath} at ${localServeUrl}`,
    );
  }

  // API Prefix
  app.setGlobalPrefix(apiPrefix);

  // Swagger Documentation
  if (appConfig?.nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Inntexia Academy API')
      .setDescription('LMS Baby Owl Backend API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

void bootstrap();
