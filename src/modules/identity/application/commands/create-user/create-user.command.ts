export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly fullName: string,
    public readonly role: string,
    public readonly createdBy: string,
  ) {}
}
