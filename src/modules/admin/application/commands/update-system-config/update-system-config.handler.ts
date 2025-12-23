import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateSystemConfigCommand } from './update-system-config.command';
import {
  updateSystemConfig,
  SystemConfigDto,
} from '../../queries/get-system-config/get-system-config.handler';

@CommandHandler(UpdateSystemConfigCommand)
export class UpdateSystemConfigHandler implements ICommandHandler<UpdateSystemConfigCommand> {
  execute(
    command: UpdateSystemConfigCommand,
  ): Promise<{ success: boolean; message: string }> {
    // Validate and update config
    const validKeys: (keyof SystemConfigDto)[] = [
      'maintenanceMode',
      'registrationEnabled',
      'maxUploadSize',
      'sessionTimeout',
      'emailNotifications',
      'smsNotifications',
      'features',
      'limits',
    ];

    const updates: Partial<SystemConfigDto> = {};

    for (const key of validKeys) {
      if (key in command.updates) {
        (updates as Record<string, unknown>)[key] = command.updates[key];
      }
    }

    updateSystemConfig(updates);

    return Promise.resolve({
      success: true,
      message: 'System configuration updated successfully',
    });
  }
}
