import { DomainError } from '@shared/domain/domain-error.base';

export class CourseNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`Course not found: ${identifier}`, 'COURSE_NOT_FOUND');
  }
}
