export class AwardBadgeCommand {
  constructor(
    public readonly userId: string,
    public readonly badgeId: string,
  ) {}
}
