import { DomainEvent } from '@shared/domain/domain-event.base';

export class UserLoggedInEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
    };
  }
}
