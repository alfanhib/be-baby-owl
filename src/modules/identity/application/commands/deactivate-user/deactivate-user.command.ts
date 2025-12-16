export class DeactivateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly deactivatedBy: string,
    public readonly reason?: string,
    public readonly action:
      | 'deactivate'
      | 'suspend'
      | 'reactivate' = 'deactivate',
  ) {}
}
