import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { UpdateProfileDto } from './dto';

interface JwtPayload {
  sub: string;
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

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getMe(@CurrentUser() user: JwtPayload): Promise<UserResponse> {
    const query = new GetUserByIdQuery(user.sub);
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
      user.sub,
      dto.fullName,
      dto.avatar,
      dto.bio,
    );
    await this.commandBus.execute<UpdateProfileCommand, void>(command);
    return { message: 'Profile updated successfully' };
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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<UsersListResponse> {
    const query = new GetUsersListQuery(
      page ?? 1,
      limit ?? 20,
      role,
      status,
      search,
    );
    return this.queryBus.execute<GetUsersListQuery, UsersListResponse>(query);
  }
}
