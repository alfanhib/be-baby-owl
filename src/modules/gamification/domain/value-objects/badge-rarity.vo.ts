import { ValueObject } from '@/shared/domain';

export enum BadgeRarityEnum {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

interface BadgeRarityProps {
  value: BadgeRarityEnum;
}

export class BadgeRarity extends ValueObject<BadgeRarityProps> {
  private constructor(props: BadgeRarityProps) {
    super(props);
  }

  get value(): BadgeRarityEnum {
    return this.props.value;
  }

  public static create(rarity: string): BadgeRarity {
    const normalizedRarity = rarity.toLowerCase() as BadgeRarityEnum;

    if (!Object.values(BadgeRarityEnum).includes(normalizedRarity)) {
      throw new Error(`Invalid badge rarity: ${rarity}`);
    }

    return new BadgeRarity({ value: normalizedRarity });
  }

  public static common(): BadgeRarity {
    return new BadgeRarity({ value: BadgeRarityEnum.COMMON });
  }

  public static rare(): BadgeRarity {
    return new BadgeRarity({ value: BadgeRarityEnum.RARE });
  }

  public static epic(): BadgeRarity {
    return new BadgeRarity({ value: BadgeRarityEnum.EPIC });
  }

  public static legendary(): BadgeRarity {
    return new BadgeRarity({ value: BadgeRarityEnum.LEGENDARY });
  }

  public isCommon(): boolean {
    return this.value === BadgeRarityEnum.COMMON;
  }

  public isRare(): boolean {
    return this.value === BadgeRarityEnum.RARE;
  }

  public isEpic(): boolean {
    return this.value === BadgeRarityEnum.EPIC;
  }

  public isLegendary(): boolean {
    return this.value === BadgeRarityEnum.LEGENDARY;
  }

  public getXpBonus(): number {
    switch (this.value) {
      case BadgeRarityEnum.COMMON:
        return 10;
      case BadgeRarityEnum.RARE:
        return 25;
      case BadgeRarityEnum.EPIC:
        return 50;
      case BadgeRarityEnum.LEGENDARY:
        return 100;
      default:
        return 0;
    }
  }
}
