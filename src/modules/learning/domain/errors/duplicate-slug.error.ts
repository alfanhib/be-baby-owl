import { DomainError } from '@shared/domain/domain-error.base';

export class DuplicateSlugError extends DomainError {
  constructor(slug: string) {
    super(`Slug already exists: ${slug}`, 'DUPLICATE_SLUG');
  }
}
