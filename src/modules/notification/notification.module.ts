import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';

// Services
import { EmailService } from './email/email.service';
import { NotificationService } from './in-app/notification.service';

// Controllers
import { NotificationsController } from './interfaces/http/notifications.controller';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [NotificationsController],
  providers: [EmailService, NotificationService],
  exports: [EmailService, NotificationService],
})
export class NotificationModule {}
