import { IQuery } from '@nestjs/cqrs';

export class GetPackageInfoQuery implements IQuery {
  constructor(
    public readonly classId: string,
    public readonly studentId?: string, // Optional: get package info for specific student
  ) {}
}

