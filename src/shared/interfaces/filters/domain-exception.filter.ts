import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from '@shared/domain/domain-error.base';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.getHttpStatus(exception);

    this.logger.warn(
      `Domain exception: ${exception.code} - ${exception.message}`,
    );

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      timestamp: exception.timestamp.toISOString(),
    });
  }

  private getHttpStatus(exception: DomainError): number {
    if (exception instanceof EntityNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof ValidationError) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof UnauthorizedError) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (exception instanceof ForbiddenError) {
      return HttpStatus.FORBIDDEN;
    }
    if (exception instanceof ConflictError) {
      return HttpStatus.CONFLICT;
    }
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
