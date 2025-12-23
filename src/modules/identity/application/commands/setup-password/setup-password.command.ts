export class SetupPasswordCommand {
  constructor(
    public readonly inviteToken: string,
    public readonly newPassword: string,
  ) {}
}
