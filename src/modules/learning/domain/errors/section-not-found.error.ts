import { DomainError } from '@shared/domain/domain-error.base';

export class SectionNotFoundError extends DomainError {
  constructor(sectionId: string) {
    super(`Section not found: ${sectionId}`, 'SECTION_NOT_FOUND');
  }
}
