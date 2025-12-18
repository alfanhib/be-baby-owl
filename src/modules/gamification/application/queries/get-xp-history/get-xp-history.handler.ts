import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetXpHistoryQuery } from './get-xp-history.query';
import {
  GAMIFICATION_REPOSITORY,
  GamificationRepositoryInterface,
} from '../../../domain';

export interface XpHistoryEntry {
  id: string;
  amount: number;
  reason: string;
  reasonDisplay: string;
  referenceId?: string;
  createdAt: Date;
}

@QueryHandler(GetXpHistoryQuery)
export class GetXpHistoryHandler implements IQueryHandler<GetXpHistoryQuery> {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY)
    private readonly repository: GamificationRepositoryInterface,
  ) {}

  async execute(query: GetXpHistoryQuery): Promise<{
    entries: XpHistoryEntry[];
    total: number;
  }> {
    const { userId, limit, offset } = query;

    const transactions = await this.repository.findXpTransactionsByUserId(
      userId,
      {
        limit,
        offset,
      },
    );

    const total = await this.repository.countXpTransactionsByUserId(userId);

    const entries: XpHistoryEntry[] = transactions.map((t) => ({
      id: t.id,
      amount: t.amount.value,
      reason: t.reason.value,
      reasonDisplay: t.reason.getDisplayName(),
      referenceId: t.referenceId,
      createdAt: t.createdAt,
    }));

    return { entries, total };
  }
}
