export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly updatedBy: string,
    public readonly fullName?: string,
    public readonly avatar?: string,
    public readonly bio?: string,
  ) {}
}
