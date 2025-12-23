export class Grade {
  private constructor(
    private readonly _score: number,
    private readonly _maxScore: number,
  ) {}

  get score(): number {
    return this._score;
  }

  get maxScore(): number {
    return this._maxScore;
  }

  get percentage(): number {
    if (this._maxScore === 0) return 0;
    return Math.round((this._score / this._maxScore) * 100);
  }

  get isPassing(): boolean {
    return this.percentage >= 70; // 70% is passing grade
  }

  static create(score: number, maxScore: number): Grade {
    if (score < 0) {
      throw new Error('Score cannot be negative');
    }
    if (maxScore <= 0) {
      throw new Error('Max score must be positive');
    }
    if (score > maxScore) {
      throw new Error('Score cannot exceed max score');
    }
    return new Grade(score, maxScore);
  }

  equals(other: Grade): boolean {
    return this._score === other._score && this._maxScore === other._maxScore;
  }

  toString(): string {
    return `${this._score}/${this._maxScore} (${this.percentage}%)`;
  }
}
