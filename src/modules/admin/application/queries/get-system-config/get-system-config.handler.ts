import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSystemConfigQuery } from './get-system-config.query';
import { ConfigService } from '@nestjs/config';

export interface SystemConfigDto {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  features: {
    quizzes: boolean;
    codingExercises: boolean;
    liveClasses: boolean;
    officeHours: boolean;
  };
  limits: {
    maxStudentsPerGroupClass: number;
    maxFileSizeVideo: number;
    maxFileSizeDocument: number;
  };
}

// In-memory config store (would be replaced with database in production)
let systemConfigStore: Partial<SystemConfigDto> = {};

export function updateSystemConfig(updates: Partial<SystemConfigDto>): void {
  systemConfigStore = { ...systemConfigStore, ...updates };
}

export function getSystemConfigStore(): Partial<SystemConfigDto> {
  return systemConfigStore;
}

@QueryHandler(GetSystemConfigQuery)
export class GetSystemConfigHandler implements IQueryHandler<GetSystemConfigQuery> {
  constructor(private readonly configService: ConfigService) {}

  execute(): Promise<SystemConfigDto> {
    // Merge stored config with defaults
    const defaults: SystemConfigDto = {
      maintenanceMode: false,
      registrationEnabled: true,
      maxUploadSize: 104857600, // 100MB
      sessionTimeout: 3600, // 1 hour
      emailNotifications: true,
      smsNotifications: false,
      features: {
        quizzes: true,
        codingExercises: true,
        liveClasses: true,
        officeHours: true,
      },
      limits: {
        maxStudentsPerGroupClass: 20,
        maxFileSizeVideo: 524288000, // 500MB
        maxFileSizeDocument: 52428800, // 50MB
      },
    };

    return Promise.resolve({
      ...defaults,
      ...systemConfigStore,
      features: {
        ...defaults.features,
        ...(systemConfigStore.features || {}),
      },
      limits: {
        ...defaults.limits,
        ...(systemConfigStore.limits || {}),
      },
    });
  }
}
