export class UpdateMaterialProgressCommand {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly lessonId: string,
    public readonly exerciseId: string,
    public readonly scrollDepth: number, // 0-100
  ) {}
}
