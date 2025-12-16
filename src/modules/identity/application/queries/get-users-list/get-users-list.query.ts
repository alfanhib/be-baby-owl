export class GetUsersListQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly role?: string,
    public readonly status?: string,
    public readonly search?: string,
  ) {}
}
