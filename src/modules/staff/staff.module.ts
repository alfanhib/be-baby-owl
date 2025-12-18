import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';
import { StaffController } from './interfaces/http/controllers/staff.controller';
import { IdentityModule } from '@identity/identity.module';
import { ClassManagementModule } from '@class-management/class-management.module';

@Module({
  imports: [CqrsModule, IdentityModule, ClassManagementModule],
  controllers: [StaffController],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [],
})
export class StaffModule {}
