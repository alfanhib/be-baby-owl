import { ValueObject } from '@shared/domain/value-object.base';

export enum ExerciseTypeEnum {
  VIDEO = 'video',
  QUIZ = 'quiz',
  MATERIAL = 'material',
  ASSIGNMENT = 'assignment',
  CODING_CHALLENGE = 'coding_challenge',
  CODING_PLAYGROUND = 'coding_playground',
}

interface ExerciseTypeProps {
  value: ExerciseTypeEnum;
}

export class ExerciseType extends ValueObject<ExerciseTypeProps> {
  private constructor(props: ExerciseTypeProps) {
    super(props);
  }

  get value(): ExerciseTypeEnum {
    return this.props.value;
  }

  static create(type: string): ExerciseType {
    const validTypes = Object.values(ExerciseTypeEnum);
    if (!validTypes.includes(type as ExerciseTypeEnum)) {
      throw new Error(`Invalid exercise type: ${type}`);
    }
    return new ExerciseType({ value: type as ExerciseTypeEnum });
  }

  static video(): ExerciseType {
    return new ExerciseType({ value: ExerciseTypeEnum.VIDEO });
  }

  static quiz(): ExerciseType {
    return new ExerciseType({ value: ExerciseTypeEnum.QUIZ });
  }

  static material(): ExerciseType {
    return new ExerciseType({ value: ExerciseTypeEnum.MATERIAL });
  }

  static assignment(): ExerciseType {
    return new ExerciseType({ value: ExerciseTypeEnum.ASSIGNMENT });
  }

  static codingChallenge(): ExerciseType {
    return new ExerciseType({ value: ExerciseTypeEnum.CODING_CHALLENGE });
  }

  static codingPlayground(): ExerciseType {
    return new ExerciseType({ value: ExerciseTypeEnum.CODING_PLAYGROUND });
  }

  isVideo(): boolean {
    return this.props.value === ExerciseTypeEnum.VIDEO;
  }

  isQuiz(): boolean {
    return this.props.value === ExerciseTypeEnum.QUIZ;
  }

  isMaterial(): boolean {
    return this.props.value === ExerciseTypeEnum.MATERIAL;
  }

  isAssignment(): boolean {
    return this.props.value === ExerciseTypeEnum.ASSIGNMENT;
  }

  isCodingChallenge(): boolean {
    return this.props.value === ExerciseTypeEnum.CODING_CHALLENGE;
  }

  isCodingPlayground(): boolean {
    return this.props.value === ExerciseTypeEnum.CODING_PLAYGROUND;
  }

  requiresManualGrading(): boolean {
    return this.isAssignment();
  }

  hasAutoGrading(): boolean {
    return this.isQuiz() || this.isCodingChallenge();
  }
}
