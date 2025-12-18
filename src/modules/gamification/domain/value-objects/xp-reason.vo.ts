import { ValueObject } from '@/shared/domain';

export enum XpReasonEnum {
  LESSON_COMPLETE = 'lesson_complete',
  EXERCISE_COMPLETE = 'exercise_complete',
  QUIZ_COMPLETE = 'quiz_complete',
  QUIZ_PERFECT_SCORE = 'quiz_perfect_score',
  ASSIGNMENT_SUBMITTED = 'assignment_submitted',
  ASSIGNMENT_GRADED = 'assignment_graded',
  COURSE_COMPLETE = 'course_complete',
  BADGE_EARNED = 'badge_earned',
  STREAK_BONUS = 'streak_bonus',
  DAILY_QUEST_COMPLETE = 'daily_quest_complete',
  FIRST_LOGIN_OF_DAY = 'first_login_of_day',
  ATTENDANCE_PRESENT = 'attendance_present',
  CODING_CHALLENGE_PASSED = 'coding_challenge_passed',
}

interface XpReasonProps {
  value: XpReasonEnum;
}

// Default XP amounts for each reason
const XP_AMOUNTS: Record<XpReasonEnum, number> = {
  [XpReasonEnum.LESSON_COMPLETE]: 25,
  [XpReasonEnum.EXERCISE_COMPLETE]: 10,
  [XpReasonEnum.QUIZ_COMPLETE]: 15,
  [XpReasonEnum.QUIZ_PERFECT_SCORE]: 25,
  [XpReasonEnum.ASSIGNMENT_SUBMITTED]: 20,
  [XpReasonEnum.ASSIGNMENT_GRADED]: 30,
  [XpReasonEnum.COURSE_COMPLETE]: 200,
  [XpReasonEnum.BADGE_EARNED]: 10,
  [XpReasonEnum.STREAK_BONUS]: 10,
  [XpReasonEnum.DAILY_QUEST_COMPLETE]: 15,
  [XpReasonEnum.FIRST_LOGIN_OF_DAY]: 5,
  [XpReasonEnum.ATTENDANCE_PRESENT]: 10,
  [XpReasonEnum.CODING_CHALLENGE_PASSED]: 30,
};

export class XpReason extends ValueObject<XpReasonProps> {
  private constructor(props: XpReasonProps) {
    super(props);
  }

  get value(): XpReasonEnum {
    return this.props.value;
  }

  public static create(reason: string): XpReason {
    const normalizedReason = reason.toLowerCase() as XpReasonEnum;

    if (!Object.values(XpReasonEnum).includes(normalizedReason)) {
      throw new Error(`Invalid XP reason: ${reason}`);
    }

    return new XpReason({ value: normalizedReason });
  }

  public static lessonComplete(): XpReason {
    return new XpReason({ value: XpReasonEnum.LESSON_COMPLETE });
  }

  public static exerciseComplete(): XpReason {
    return new XpReason({ value: XpReasonEnum.EXERCISE_COMPLETE });
  }

  public static quizComplete(): XpReason {
    return new XpReason({ value: XpReasonEnum.QUIZ_COMPLETE });
  }

  public static quizPerfectScore(): XpReason {
    return new XpReason({ value: XpReasonEnum.QUIZ_PERFECT_SCORE });
  }

  public static assignmentSubmitted(): XpReason {
    return new XpReason({ value: XpReasonEnum.ASSIGNMENT_SUBMITTED });
  }

  public static assignmentGraded(): XpReason {
    return new XpReason({ value: XpReasonEnum.ASSIGNMENT_GRADED });
  }

  public static courseComplete(): XpReason {
    return new XpReason({ value: XpReasonEnum.COURSE_COMPLETE });
  }

  public static badgeEarned(): XpReason {
    return new XpReason({ value: XpReasonEnum.BADGE_EARNED });
  }

  public static streakBonus(): XpReason {
    return new XpReason({ value: XpReasonEnum.STREAK_BONUS });
  }

  public static dailyQuestComplete(): XpReason {
    return new XpReason({ value: XpReasonEnum.DAILY_QUEST_COMPLETE });
  }

  public static firstLoginOfDay(): XpReason {
    return new XpReason({ value: XpReasonEnum.FIRST_LOGIN_OF_DAY });
  }

  public static attendancePresent(): XpReason {
    return new XpReason({ value: XpReasonEnum.ATTENDANCE_PRESENT });
  }

  public static codingChallengePassed(): XpReason {
    return new XpReason({ value: XpReasonEnum.CODING_CHALLENGE_PASSED });
  }

  public getDefaultXpAmount(): number {
    return XP_AMOUNTS[this.value];
  }

  public getDisplayName(): string {
    const displayNames: Record<XpReasonEnum, string> = {
      [XpReasonEnum.LESSON_COMPLETE]: 'Lesson Completed',
      [XpReasonEnum.EXERCISE_COMPLETE]: 'Exercise Completed',
      [XpReasonEnum.QUIZ_COMPLETE]: 'Quiz Completed',
      [XpReasonEnum.QUIZ_PERFECT_SCORE]: 'Perfect Quiz Score',
      [XpReasonEnum.ASSIGNMENT_SUBMITTED]: 'Assignment Submitted',
      [XpReasonEnum.ASSIGNMENT_GRADED]: 'Assignment Graded',
      [XpReasonEnum.COURSE_COMPLETE]: 'Course Completed',
      [XpReasonEnum.BADGE_EARNED]: 'Badge Earned',
      [XpReasonEnum.STREAK_BONUS]: 'Streak Bonus',
      [XpReasonEnum.DAILY_QUEST_COMPLETE]: 'Daily Quest Completed',
      [XpReasonEnum.FIRST_LOGIN_OF_DAY]: 'Daily Login',
      [XpReasonEnum.ATTENDANCE_PRESENT]: 'Attendance',
      [XpReasonEnum.CODING_CHALLENGE_PASSED]: 'Coding Challenge Passed',
    };
    return displayNames[this.value];
  }
}
