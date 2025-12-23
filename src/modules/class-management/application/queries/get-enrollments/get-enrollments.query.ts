export class GetEnrollmentsQuery {
  constructor(
    public readonly filters: {
      status?: string;
      paymentStatus?: string;
      classId?: string;
      courseId?: string;
      studentId?: string;
      search?: string;
    },
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
