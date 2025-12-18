export class GetClassStudentsQuery {
  constructor(
    public readonly classId: string,
    public readonly instructorId: string,
  ) {}
}
