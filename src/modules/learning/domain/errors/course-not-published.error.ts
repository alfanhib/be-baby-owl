import { DomainError } from '@shared/domain/domain-error.base';

export class CourseNotPublishedError extends DomainError {
  constructor(courseId: string) {
    super(`Course is not published: ${courseId}`, 'COURSE_NOT_PUBLISHED');
  }
}
