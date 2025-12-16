import { ValueObject } from '@shared/domain/value-object.base';

export enum CourseLevelEnum {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

interface CourseLevelProps {
  value: CourseLevelEnum;
}

export class CourseLevel extends ValueObject<CourseLevelProps> {
  private constructor(props: CourseLevelProps) {
    super(props);
  }

  get value(): CourseLevelEnum {
    return this.props.value;
  }

  static create(level: string): CourseLevel {
    const validLevels = Object.values(CourseLevelEnum);
    if (!validLevels.includes(level as CourseLevelEnum)) {
      throw new Error(`Invalid course level: ${level}`);
    }
    return new CourseLevel({ value: level as CourseLevelEnum });
  }

  static beginner(): CourseLevel {
    return new CourseLevel({ value: CourseLevelEnum.BEGINNER });
  }

  static intermediate(): CourseLevel {
    return new CourseLevel({ value: CourseLevelEnum.INTERMEDIATE });
  }

  static advanced(): CourseLevel {
    return new CourseLevel({ value: CourseLevelEnum.ADVANCED });
  }
}
