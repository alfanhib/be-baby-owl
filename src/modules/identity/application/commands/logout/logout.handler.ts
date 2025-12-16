import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { RedisService } from '@shared/infrastructure/redis/redis.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly redisService: RedisService) {}

  async execute(command: LogoutCommand): Promise<void> {
    // Remove refresh token from Redis
    await this.redisService.del(`refresh_token:${command.userId}`);
  }
}
