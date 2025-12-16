import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '@shared/interfaces/decorators/public.decorator';
import { CurrentUser } from '@shared/interfaces/decorators/current-user.decorator';
import { RegisterCommand } from '@identity/application/commands/register-user';
import { LoginCommand } from '@identity/application/commands/login';
import { RefreshTokenCommand } from '@identity/application/commands/refresh-token';
import { LogoutCommand } from '@identity/application/commands/logout';
import { VerifyEmailCommand } from '@identity/application/commands/verify-email';
import { ChangePasswordCommand } from '@identity/application/commands/change-password';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  VerifyEmailDto,
  ChangePasswordDto,
} from '@identity/interfaces/http/dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface RegisterResult {
  userId: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; fullName: string; role: string };
}

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body() dto: RegisterDto,
  ): Promise<{ message: string; userId: string }> {
    const command = new RegisterCommand(dto.email, dto.password, dto.fullName);
    const result = await this.commandBus.execute<
      RegisterCommand,
      RegisterResult
    >(command);

    return {
      message: 'User registered successfully',
      userId: result.userId,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<LoginResult> {
    const command = new LoginCommand(dto.email, dto.password);
    return this.commandBus.execute<LoginCommand, LoginResult>(command);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<RefreshResult> {
    const command = new RefreshTokenCommand(dto.refreshToken);
    return this.commandBus.execute<RefreshTokenCommand, RefreshResult>(command);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@CurrentUser() user: JwtPayload): Promise<{ message: string }> {
    const command = new LogoutCommand(user.sub);
    await this.commandBus.execute<LogoutCommand, void>(command);
    return { message: 'Logout successful' };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<{ message: string }> {
    const command = new VerifyEmailCommand(dto.token);
    await this.commandBus.execute<VerifyEmailCommand, void>(command);
    return { message: 'Email verified successfully' };
  }

  @Put('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const command = new ChangePasswordCommand(
      user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
    await this.commandBus.execute<ChangePasswordCommand, void>(command);
    return { message: 'Password changed successfully' };
  }
}
