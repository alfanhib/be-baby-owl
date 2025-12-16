export class ChangeUserRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly newRole: string,
    public readonly changedBy: string,
  ) {}
}
