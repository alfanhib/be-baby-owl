/**
 * Base Value Object class
 * Value objects are immutable and compared by their values, not identity
 */
export abstract class ValueObject<TProps> {
  protected readonly props: TProps;

  protected constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  /**
   * Check equality by comparing all properties
   */
  equals(vo?: ValueObject<TProps>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    if (vo.props === undefined) {
      return false;
    }

    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }

  /**
   * Get a copy of the properties
   */
  toObject(): TProps {
    return { ...this.props };
  }
}
