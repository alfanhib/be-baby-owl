export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly fullName: string,
    public readonly role?: string,
  ) {}
}

// Alias for backward compatibility
export { RegisterCommand as RegisterUserCommand };
