import { ExerciseContent } from '@learning/domain/entities/exercise.entity';

export class UpdateExerciseCommand {
  constructor(
    public readonly exerciseId: string,
    public readonly courseId: string,
    public readonly sectionId: string,
    public readonly lessonId: string,
    public readonly title: string | undefined,
    public readonly content: ExerciseContent | undefined,
    public readonly estimatedDuration: number | undefined,
    public readonly userId: string,
  ) {}
}
