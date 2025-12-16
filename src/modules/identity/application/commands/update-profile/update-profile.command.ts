export class UpdateProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly fullName?: string,
    public readonly avatar?: string,
    public readonly bio?: string,
  ) {}
}
