import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QueryHandlers } from './application/queries';
import { InstructorController } from './interfaces/http/controllers/instructor.controller';

@Module({
  imports: [CqrsModule],
  controllers: [InstructorController],
  providers: [...QueryHandlers],
  exports: [],
})
export class InstructorModule {}
