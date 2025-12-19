import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QueryHandlers } from './application/queries';
import { StudentController } from './interfaces/http/controllers/student.controller';

@Module({
  imports: [CqrsModule],
  controllers: [StudentController],
  providers: [...QueryHandlers],
  exports: [],
})
export class StudentModule {}
