import { DomainEvent } from '@shared/domain/domain-event.base';

export class UserDeactivatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly reason?: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
      reason: this.reason,
    };
  }
}
