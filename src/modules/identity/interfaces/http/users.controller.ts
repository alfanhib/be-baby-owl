import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser } from '@shared/interfaces/decorators/current-user.decorator';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import {
  GetUserByIdQuery,
  UserResponse,
} from '@identity/application/queries/get-user-by-id';
import {
  GetUsersListQuery,
  UsersListResponse,
} from '@identity/application/queries/get-users-list';
import { UpdateProfileCommand } from '@identity/application/commands/update-profile';
import {
  CreateUserCommand,
  CreateUserResult,
} from '@identity/application/commands/create-user';
import {
  UpdateUserCommand,
  UpdateUserResult,
} from '@identity/application/commands/update-user';
import {
  DeactivateUserCommand,
  DeactivateUserResult,
} from '@identity/application/commands/deactivate-user';
import {
  ChangeUserRoleCommand,
  ChangeUserRoleResult,
} from '@identity/application/commands/change-user-role';
import {
  RegenerateInviteCommand,
  RegenerateInviteResult,
} from '@identity/application/commands/regenerate-invite';
import {
  UpdateProfileDto,
  CreateUserDto,
  UpdateUserDto,
  DeactivateUserDto,
  ChangeUserRoleDto,
} from './dto';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ============================================
  // Current User Endpoints
  // ============================================

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserResponse> {
    const query = new GetUserByIdQuery(user.id);
    return this.queryBus.execute<GetUserByIdQuery, UserResponse>(query);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<{ message: string }> {
    const command = new UpdateProfileCommand(
      user.id,
      dto.fullName,
      dto.avatar,
      dto.bio,
    );
    await this.commandBus.execute<UpdateProfileCommand, void>(command);
    return { message: 'Profile updated successfully' };
  }

  // ============================================
  // Admin User Management Endpoints
  // ============================================

  @Post()
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Create new user (Staff/Super Admin only)' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async createUser(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateUserDto,
  ): Promise<CreateUserResult> {
    const command = new CreateUserCommand(
      dto.email,
      dto.password,
      dto.fullName,
      dto.role,
      user.id,
      dto.username,
    );
    return this.commandBus.execute<CreateUserCommand, CreateUserResult>(
      command,
    );
  }

  @Get()
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get users list (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users list' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<UsersListResponse> {
    const query = new GetUsersListQuery(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      role,
      status,
      search,
    );
    return this.queryBus.execute<GetUsersListQuery, UsersListResponse>(query);
  }

  @Get(':id')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponse> {
    const query = new GetUserByIdQuery(id);
    return this.queryBus.execute<GetUserByIdQuery, UserResponse>(query);
  }

  @Put(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update user by ID (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<UpdateUserResult> {
    const command = new UpdateUserCommand(
      id,
      user.id,
      dto.fullName,
      dto.avatar,
      dto.bio,
    );
    return this.commandBus.execute<UpdateUserCommand, UpdateUserResult>(
      command,
    );
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({
    summary: 'Deactivate/Suspend/Reactivate user (Super Admin only)',
  })
  @ApiResponse({ status: 200, description: 'User status updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: DeactivateUserDto,
  ): Promise<DeactivateUserResult> {
    const command = new DeactivateUserCommand(
      id,
      user.id,
      dto.reason,
      dto.action,
    );
    return this.commandBus.execute<DeactivateUserCommand, DeactivateUserResult>(
      command,
    );
  }

  @Put(':id/role')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Change user role (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Role changed' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changeUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangeUserRoleDto,
  ): Promise<ChangeUserRoleResult> {
    const command = new ChangeUserRoleCommand(id, dto.role, user.id);
    return this.commandBus.execute<ChangeUserRoleCommand, ChangeUserRoleResult>(
      command,
    );
  }

  @Post(':id/regenerate-invite')
  @Roles('staff', 'super_admin')
  @ApiOperation({
    summary: 'Regenerate invite URL for user (Staff/Super Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Invite URL regenerated',
    schema: {
      properties: {
        userId: { type: 'string' },
        email: { type: 'string' },
        inviteUrl: { type: 'string' },
        inviteTokenExpiry: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User has already set their password',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async regenerateInvite(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RegenerateInviteResult> {
    const command = new RegenerateInviteCommand(id);
    return this.commandBus.execute<
      RegenerateInviteCommand,
      RegenerateInviteResult
    >(command);
  }
}
