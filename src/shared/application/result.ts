/**
 * Result class for handling success/failure without exceptions
 * Inspired by Rust's Result type
 */
export class Result<T, E = Error> {
  private readonly _isSuccess: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    if (isSuccess && error) {
      throw new Error('Invalid Result: Success cannot have an error');
    }
    if (!isSuccess && !error) {
      throw new Error('Invalid Result: Failure must have an error');
    }

    this._isSuccess = isSuccess;
    this._value = value;
    this._error = error;
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Get the success value
   * Throws if result is failure
   */
  get value(): T {
    if (!this._isSuccess) {
      throw new Error(
        'Cannot get value from a failed Result. Check isSuccess first.',
      );
    }
    return this._value as T;
  }

  /**
   * Get the error
   * Throws if result is success
   */
  get error(): E {
    if (this._isSuccess) {
      throw new Error(
        'Cannot get error from a successful Result. Check isFailure first.',
      );
    }
    return this._error as E;
  }

  /**
   * Get value or default
   */
  getOrDefault(defaultValue: T): T {
    return this._isSuccess ? (this._value as T) : defaultValue;
  }

  /**
   * Get value or throw error
   */
  getOrThrow(): T {
    if (!this._isSuccess) {
      const err = this._error;
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(String(err));
    }
    return this._value as T;
  }

  /**
   * Alias for value getter - Get the success value
   */
  getValue(): T {
    return this.value;
  }

  /**
   * Throw if the result is a failure
   */
  throwIfFailed(): void {
    if (!this._isSuccess) {
      const err = this._error;
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(String(err));
    }
  }

  /**
   * Create a success result
   */
  static ok<T>(value?: T): Result<T, never> {
    return new Result<T, never>(true, value);
  }

  /**
   * Create a failure result
   */
  static fail<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined, error);
  }

  /**
   * Combine multiple results into one
   * Returns first failure or success with void
   */
  static combine<E = Error>(results: Result<unknown, E>[]): Result<void, E> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error);
      }
    }
    return Result.ok();
  }

  /**
   * Combine multiple results and collect all values
   */
  static combineAll<T, E = Error>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error);
      }
      values.push(result.value);
    }
    return Result.ok(values);
  }

  /**
   * Map the success value
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.ok(fn(this._value as T));
    }
    return Result.fail(this._error as E);
  }

  /**
   * FlatMap for chaining Results
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value as T);
    }
    return Result.fail(this._error as E);
  }

  /**
   * Execute side effect on success
   */
  onSuccess(fn: (value: T) => void): Result<T, E> {
    if (this._isSuccess) {
      fn(this._value as T);
    }
    return this;
  }

  /**
   * Execute side effect on failure
   */
  onFailure(fn: (error: E) => void): Result<T, E> {
    if (!this._isSuccess) {
      fn(this._error as E);
    }
    return this;
  }
}
