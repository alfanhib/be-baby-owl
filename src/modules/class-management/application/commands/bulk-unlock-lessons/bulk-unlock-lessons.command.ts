export interface BulkUnlockItem {
  lessonId: string;
  meetingNumber?: number;
  notes?: string;
}

export class BulkUnlockLessonsCommand {
  constructor(
    public readonly classId: string,
    public readonly lessons: BulkUnlockItem[],
    public readonly unlockedBy: string,
  ) {}
}
