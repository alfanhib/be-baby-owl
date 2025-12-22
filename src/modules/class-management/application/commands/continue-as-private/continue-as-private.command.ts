import { ICommand } from '@nestjs/cqrs';

export class ContinueAsPrivateCommand implements ICommand {
  constructor(
    public readonly sourceClassId: string,
    public readonly studentId: string,
    public readonly packageMeetings: number,
    public readonly instructorId?: string, // Optional: use same instructor if not provided
    public readonly schedules?: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      timezone?: string;
    }>,
    public readonly performedBy?: string,
  ) {}
}

