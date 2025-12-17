import { ExerciseContent } from '@learning/domain/entities/exercise.entity';

export class AddExerciseCommand {
  constructor(
    public readonly courseId: string,
    public readonly sectionId: string,
    public readonly lessonId: string,
    public readonly title: string,
    public readonly type: string,
    public readonly content: ExerciseContent,
    public readonly estimatedDuration: number | undefined,
    public readonly userId: string,
  ) {}
}
