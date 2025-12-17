export class GetExerciseDetailQuery {
  constructor(
    public readonly courseId: string,
    public readonly exerciseId: string,
    public readonly userId?: string, // Optional: include user progress
  ) {}
}
