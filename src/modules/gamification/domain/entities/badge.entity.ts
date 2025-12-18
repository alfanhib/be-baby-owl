import { Entity } from '@/shared/domain';
import { BadgeRarity } from '../value-objects';

export interface BadgeCriteria {
  type:
    | 'lessons_completed'
    | 'exercises_completed'
    | 'quizzes_completed'
    | 'perfect_quizzes'
    | 'courses_completed'
    | 'streak_days'
    | 'xp_earned'
    | 'level_reached'
    | 'assignments_submitted'
    | 'coding_challenges_passed';
  threshold: number;
}

export class Badge extends Entity<string> {
  private _name: string;
  private _description?: string;
  private _imageUrl?: string;
  private _criteria: BadgeCriteria;
  private _rarity: BadgeRarity;

  private constructor(
    id: string,
    name: string,
    criteria: BadgeCriteria,
    rarity: BadgeRarity,
    description?: string,
    imageUrl?: string,
    createdAt?: Date,
  ) {
    super(id, createdAt);
    this._name = name;
    this._description = description;
    this._imageUrl = imageUrl;
    this._criteria = criteria;
    this._rarity = rarity;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get imageUrl(): string | undefined {
    return this._imageUrl;
  }

  get criteria(): BadgeCriteria {
    return this._criteria;
  }

  get rarity(): BadgeRarity {
    return this._rarity;
  }

  public static create(
    props: {
      name: string;
      description?: string;
      imageUrl?: string;
      criteria: BadgeCriteria;
      rarity: string;
    },
    id?: string,
  ): Badge {
    return new Badge(
      id ?? crypto.randomUUID(),
      props.name,
      props.criteria,
      BadgeRarity.create(props.rarity),
      props.description,
      props.imageUrl,
    );
  }

  public static reconstitute(
    props: {
      name: string;
      description?: string;
      imageUrl?: string;
      criteria: BadgeCriteria;
      rarity: string;
      createdAt: Date;
    },
    id: string,
  ): Badge {
    return new Badge(
      id,
      props.name,
      props.criteria,
      BadgeRarity.create(props.rarity),
      props.description,
      props.imageUrl,
      props.createdAt,
    );
  }

  public checkCriteria(userStats: {
    lessonsCompleted: number;
    exercisesCompleted: number;
    quizzesCompleted: number;
    perfectQuizzes: number;
    coursesCompleted: number;
    streakDays: number;
    xpEarned: number;
    levelReached: number;
    assignmentsSubmitted: number;
    codingChallengesPassed: number;
  }): boolean {
    const { type, threshold } = this._criteria;

    switch (type) {
      case 'lessons_completed':
        return userStats.lessonsCompleted >= threshold;
      case 'exercises_completed':
        return userStats.exercisesCompleted >= threshold;
      case 'quizzes_completed':
        return userStats.quizzesCompleted >= threshold;
      case 'perfect_quizzes':
        return userStats.perfectQuizzes >= threshold;
      case 'courses_completed':
        return userStats.coursesCompleted >= threshold;
      case 'streak_days':
        return userStats.streakDays >= threshold;
      case 'xp_earned':
        return userStats.xpEarned >= threshold;
      case 'level_reached':
        return userStats.levelReached >= threshold;
      case 'assignments_submitted':
        return userStats.assignmentsSubmitted >= threshold;
      case 'coding_challenges_passed':
        return userStats.codingChallengesPassed >= threshold;
      default:
        return false;
    }
  }
}
