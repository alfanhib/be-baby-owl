import { Result } from './result';

/**
 * Base Use Case interface
 * Commands and Queries should implement this
 */
export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<Result<TResponse>>;
}

/**
 * Command handler interface (Write operations)
 */
export interface ICommandHandler<TCommand, TResult = void> {
  execute(command: TCommand): Promise<Result<TResult>>;
}

/**
 * Query handler interface (Read operations)
 */
export interface IQueryHandler<TQuery, TResult> {
  execute(query: TQuery): Promise<Result<TResult>>;
}
