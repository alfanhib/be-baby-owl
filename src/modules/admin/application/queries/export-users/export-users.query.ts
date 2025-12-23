export class ExportUsersQuery {
  constructor(
    public readonly role?: string,
    public readonly status?: string,
  ) {}
}
