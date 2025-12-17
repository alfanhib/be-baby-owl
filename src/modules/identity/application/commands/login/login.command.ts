export class LoginCommand {
  constructor(
    public readonly identifier: string, // username or email
    public readonly password: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}
