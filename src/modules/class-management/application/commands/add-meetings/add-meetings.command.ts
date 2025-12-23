import { ICommand } from '@nestjs/cqrs';

export class AddMeetingsCommand implements ICommand {
  constructor(
    public readonly classId: string,
    public readonly meetingsToAdd: number,
    public readonly performedBy: string,
  ) {}
}
