export class GetAvailableClassesQuery {
  constructor(
    public readonly courseId?: string,
    public readonly type?: 'group' | 'private',
  ) {}
}
