import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/interfaces/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/interfaces/guards/roles.guard';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import { OptionalAuth } from '@shared/interfaces/decorators/optional-auth.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@shared/interfaces/decorators/current-user.decorator';
import { WhatsAppService } from '../../whatsapp.service';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly prisma: PrismaService,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('purchase-link/:courseId')
  @OptionalAuth()
  @ApiOperation({ summary: 'Generate WhatsApp purchase link for a course' })
  @ApiParam({ name: 'courseId' })
  @ApiQuery({ name: 'packageMeetings', required: false, type: Number })
  async getPurchaseLink(
    @Param('courseId') courseId: string,
    @Query('packageMeetings') packageMeetings?: number,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<{ link: string; message: string }> {
    // Get course info
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get user info if logged in
    let userName: string | undefined;
    let userEmail: string | undefined;

    if (user) {
      const userInfo = await this.prisma.user.findUnique({
        where: { id: user.userId },
        select: { fullName: true, email: true },
      });
      userName = userInfo?.fullName ?? undefined;
      userEmail = userInfo?.email;
    }

    const messageData = {
      courseTitle: course.title,
      packageMeetings: packageMeetings || 10,
      userName,
      userEmail,
    };

    const link = this.whatsAppService.generatePurchaseLink(messageData);
    const message = this.whatsAppService.generatePurchaseMessage(messageData);

    return { link, message };
  }

  @Get('continue-link/:enrollmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'staff', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate WhatsApp continue-as-private link' })
  @ApiParam({ name: 'enrollmentId' })
  async getContinueLink(
    @Param('enrollmentId') enrollmentId: string,
  ): Promise<{ link: string; message: string }> {
    // Get enrollment with class and course info
    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        class: {
          include: {
            course: true,
          },
        },
        student: {
          select: { fullName: true, email: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Calculate lessons remaining via sections
    const totalLessons = await this.prisma.lesson.count({
      where: {
        section: {
          courseId: enrollment.class.courseId,
        },
      },
    });

    const unlockedLessons = await this.prisma.lessonUnlock.count({
      where: { classId: enrollment.classId },
    });

    const lessonsRemaining = totalLessons - unlockedLessons;

    const messageData = {
      courseName: enrollment.class.course.title,
      className: enrollment.class.name,
      lessonsRemaining,
      userName: enrollment.student.fullName ?? undefined,
      userEmail: enrollment.student.email,
    };

    const link = this.whatsAppService.generateContinuePrivateLink(messageData);
    const message =
      this.whatsAppService.generateContinuePrivateMessage(messageData);

    return { link, message };
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get WhatsApp settings (admin only)' })
  getSettings(): Promise<{ phone: string; configured: boolean }> {
    const phone = this.whatsAppService.getDefaultPhone();
    return Promise.resolve({ phone, configured: !!phone });
  }
}
