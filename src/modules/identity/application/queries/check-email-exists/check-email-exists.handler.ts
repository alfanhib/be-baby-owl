import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CheckEmailExistsQuery } from './check-email-exists.query';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';

export interface CheckEmailExistsResponse {
  exists: boolean;
}

@QueryHandler(CheckEmailExistsQuery)
export class CheckEmailExistsHandler implements IQueryHandler<CheckEmailExistsQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: CheckEmailExistsQuery,
  ): Promise<CheckEmailExistsResponse> {
    const exists = await this.userRepository.emailExists(query.email);

    return {
      exists,
    };
  }
}
