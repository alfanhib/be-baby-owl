export class GetCourseQuery {
  constructor(public readonly courseId: string) {}
}

export class GetCourseBySlugQuery {
  constructor(public readonly slug: string) {}
}
