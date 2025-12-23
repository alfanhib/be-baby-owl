export interface NewStudentInput {
  name: string;
  email: string;
  phone?: string;
}

export class CreateEnrollmentCommand {
  constructor(
    public readonly classId: string,
    public readonly studentId: string | undefined,
    public readonly student: NewStudentInput | undefined,
    public readonly amount: number,
    public readonly paymentStatus: string,
    public readonly notes?: string,
  ) {}
}
