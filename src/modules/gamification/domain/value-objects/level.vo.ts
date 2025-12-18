import { ValueObject } from '@/shared/domain';
import { XpAmount } from './xp-amount.vo';

interface LevelProps {
  value: number;
}

// XP thresholds for each level (cumulative)
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
const LEVEL_THRESHOLDS: number[] = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  850, // Level 5
  1300, // Level 6
  1900, // Level 7
  2650, // Level 8
  3550, // Level 9
  4600, // Level 10
  5800, // Level 11
  7200, // Level 12
  8800, // Level 13
  10600, // Level 14
  12600, // Level 15
  14900, // Level 16
  17500, // Level 17
  20400, // Level 18
  23600, // Level 19
  27100, // Level 20
  31000, // Level 21
  35300, // Level 22
  40000, // Level 23
  45100, // Level 24
  50600, // Level 25
  56600, // Level 26
  63100, // Level 27
  70100, // Level 28
  77600, // Level 29
  85600, // Level 30
  94200, // Level 31
  103400, // Level 32
  113200, // Level 33
  123600, // Level 34
  134600, // Level 35
  146300, // Level 36
  158700, // Level 37
  171800, // Level 38
  185600, // Level 39
  200200, // Level 40
  215600, // Level 41
  231800, // Level 42
  248800, // Level 43
  266700, // Level 44
  285500, // Level 45
  305200, // Level 46
  325800, // Level 47
  347400, // Level 48
  370000, // Level 49
  393600, // Level 50
];

const MAX_LEVEL = 50;

export class Level extends ValueObject<LevelProps> {
  private constructor(props: LevelProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  public static create(level: number): Level {
    const clampedLevel = Math.max(1, Math.min(level, MAX_LEVEL));
    return new Level({ value: clampedLevel });
  }

  public static fromXp(totalXp: XpAmount): Level {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXp.value >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return Level.create(level);
  }

  public static getXpRequiredForLevel(level: number): number {
    const index = Math.max(0, Math.min(level - 1, LEVEL_THRESHOLDS.length - 1));
    return LEVEL_THRESHOLDS[index];
  }

  public static getXpRequiredForNextLevel(currentLevel: number): number {
    if (currentLevel >= MAX_LEVEL) {
      return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    }
    return LEVEL_THRESHOLDS[currentLevel];
  }

  public getXpForCurrentLevel(): number {
    return Level.getXpRequiredForLevel(this.value);
  }

  public getXpForNextLevel(): number {
    return Level.getXpRequiredForNextLevel(this.value);
  }

  public getProgressToNextLevel(totalXp: XpAmount): number {
    if (this.value >= MAX_LEVEL) {
      return 100;
    }

    const currentLevelXp = this.getXpForCurrentLevel();
    const nextLevelXp = this.getXpForNextLevel();
    const xpInCurrentLevel = totalXp.value - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp - currentLevelXp;

    return Math.min(
      100,
      Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100),
    );
  }

  public isMaxLevel(): boolean {
    return this.value >= MAX_LEVEL;
  }

  public canLevelUp(totalXp: XpAmount): boolean {
    if (this.isMaxLevel()) {
      return false;
    }
    return totalXp.value >= this.getXpForNextLevel();
  }

  public levelUp(): Level {
    if (this.isMaxLevel()) {
      return this;
    }
    return Level.create(this.value + 1);
  }
}
