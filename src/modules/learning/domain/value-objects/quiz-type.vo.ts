import { ValueObject } from '@shared/domain/value-object.base';

export enum QuizTypeEnum {
  MULTIPLE_CHOICE = 'multiple_choice',
  MATCH_PAIRS = 'match_pairs',
  FILL_BLANKS = 'fill_blanks',
  TRUE_FALSE = 'true_false',
  SENTENCE_BUILDING = 'sentence_building',
  LISTENING = 'listening',
}

interface QuizTypeProps {
  value: QuizTypeEnum;
}

export class QuizType extends ValueObject<QuizTypeProps> {
  private constructor(props: QuizTypeProps) {
    super(props);
  }

  get value(): QuizTypeEnum {
    return this.props.value;
  }

  static create(type: string): QuizType {
    const validTypes = Object.values(QuizTypeEnum);
    if (!validTypes.includes(type as QuizTypeEnum)) {
      throw new Error(`Invalid quiz type: ${type}`);
    }
    return new QuizType({ value: type as QuizTypeEnum });
  }

  static multipleChoice(): QuizType {
    return new QuizType({ value: QuizTypeEnum.MULTIPLE_CHOICE });
  }

  static matchPairs(): QuizType {
    return new QuizType({ value: QuizTypeEnum.MATCH_PAIRS });
  }

  static fillBlanks(): QuizType {
    return new QuizType({ value: QuizTypeEnum.FILL_BLANKS });
  }

  static trueFalse(): QuizType {
    return new QuizType({ value: QuizTypeEnum.TRUE_FALSE });
  }

  static sentenceBuilding(): QuizType {
    return new QuizType({ value: QuizTypeEnum.SENTENCE_BUILDING });
  }

  static listening(): QuizType {
    return new QuizType({ value: QuizTypeEnum.LISTENING });
  }
}
