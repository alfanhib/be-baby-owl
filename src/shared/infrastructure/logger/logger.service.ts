import {
  Injectable,
  LoggerService as NestLoggerService,
  Scope,
} from '@nestjs/common';

export interface LogContext {
  [key: string]: unknown;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: string | LogContext): void {
    const ctx = this.resolveContext(context);
    const extra = this.resolveExtra(context);
    console.log(this.formatMessage('LOG', message, ctx, extra));
  }

  error(message: string, trace?: string, context?: string | LogContext): void {
    const ctx = this.resolveContext(context);
    const extra = this.resolveExtra(context);
    console.error(this.formatMessage('ERROR', message, ctx, extra));
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string | LogContext): void {
    const ctx = this.resolveContext(context);
    const extra = this.resolveExtra(context);
    console.warn(this.formatMessage('WARN', message, ctx, extra));
  }

  debug(message: string, context?: string | LogContext): void {
    if (process.env.NODE_ENV === 'production') return;
    const ctx = this.resolveContext(context);
    const extra = this.resolveExtra(context);
    console.debug(this.formatMessage('DEBUG', message, ctx, extra));
  }

  verbose(message: string, context?: string | LogContext): void {
    if (process.env.NODE_ENV === 'production') return;
    const ctx = this.resolveContext(context);
    const extra = this.resolveExtra(context);
    console.log(this.formatMessage('VERBOSE', message, ctx, extra));
  }

  private resolveContext(context?: string | LogContext): string | undefined {
    if (typeof context === 'string') {
      return context;
    }
    return this.context;
  }

  private resolveExtra(context?: string | LogContext): LogContext | undefined {
    if (typeof context === 'object') {
      return context;
    }
    return undefined;
  }

  private formatMessage(
    level: string,
    message: string,
    context?: string,
    extra?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : '';
    const extraStr = extra ? ` ${JSON.stringify(extra)}` : '';
    return `${timestamp} ${level} ${ctx} ${message}${extraStr}`;
  }
}
