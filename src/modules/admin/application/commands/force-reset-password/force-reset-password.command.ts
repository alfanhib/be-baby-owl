export class ForceResetPasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly newPassword?: string, // If not provided, send reset email
  ) {}
}
