import { ValueObject } from '@shared/domain/value-object.base';

export enum ClassTypeEnum {
  GROUP = 'group',
  PRIVATE = 'private',
}

interface ClassTypeProps {
  value: ClassTypeEnum;
}

export class ClassType extends ValueObject<ClassTypeProps> {
  private constructor(props: ClassTypeProps) {
    super(props);
  }

  get value(): ClassTypeEnum {
    return this.props.value;
  }

  static create(value: string): ClassType {
    const normalized = value.toLowerCase() as ClassTypeEnum;
    if (!Object.values(ClassTypeEnum).includes(normalized)) {
      throw new Error(`Invalid class type: ${value}`);
    }
    return new ClassType({ value: normalized });
  }

  static group(): ClassType {
    return new ClassType({ value: ClassTypeEnum.GROUP });
  }

  static private(): ClassType {
    return new ClassType({ value: ClassTypeEnum.PRIVATE });
  }

  isGroup(): boolean {
    return this.props.value === ClassTypeEnum.GROUP;
  }

  isPrivate(): boolean {
    return this.props.value === ClassTypeEnum.PRIVATE;
  }
}
