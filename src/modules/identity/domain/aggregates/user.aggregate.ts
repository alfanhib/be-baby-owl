import { AggregateRoot } from '@shared/domain/aggregate-root.base';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import { Email } from '@identity/domain/value-objects/email.vo';
import { Password } from '@identity/domain/value-objects/password.vo';
import {
  UserRole,
  UserRoleEnum,
} from '@identity/domain/value-objects/user-role.vo';
import { UserStatus } from '@identity/domain/value-objects/user-status.vo';
import { UserRegisteredEvent } from '@identity/domain/events/user-registered.event';
import { UserVerifiedEvent } from '@identity/domain/events/user-verified.event';
import { PasswordChangedEvent } from '@identity/domain/events/password-changed.event';
import { UserDeactivatedEvent } from '@identity/domain/events/user-deactivated.event';
import { UserLoggedInEvent } from '@identity/domain/events/user-logged-in.event';

export interface UserProps {
  email: Email;
  username?: string;
  passwordHash: Password;
  fullName: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  mustChangePassword: boolean;
  inviteToken?: string;
  inviteTokenExpiry?: Date;
  lastLoginAt?: Date;
}

export interface CreateUserProps {
  email: string;
  username?: string;
  passwordHash: string;
  fullName: string;
  role?: UserRoleEnum;
  mustChangePassword?: boolean;
  inviteToken?: string;
  inviteTokenExpiry?: Date;
}

export interface RestoreUserProps {
  id: string;
  email: string;
  username?: string;
  passwordHash: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  mustChangePassword: boolean;
  inviteToken?: string;
  inviteTokenExpiry?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<UserId> {
  private _email: Email;
  private _username?: string;
  private _passwordHash: Password;
  private _fullName: string;
  private _avatar?: string;
  private _bio?: string;
  private _role: UserRole;
  private _status: UserStatus;
  private _emailVerified: boolean;
  private _onboardingCompleted: boolean;
  private _mustChangePassword: boolean;
  private _inviteToken?: string;
  private _inviteTokenExpiry?: Date;
  private _lastLoginAt?: Date;

  private constructor(
    id: UserId,
    props: UserProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._email = props.email;
    this._username = props.username;
    this._passwordHash = props.passwordHash;
    this._fullName = props.fullName;
    this._avatar = props.avatar;
    this._bio = props.bio;
    this._role = props.role;
    this._status = props.status;
    this._emailVerified = props.emailVerified;
    this._onboardingCompleted = props.onboardingCompleted;
    this._mustChangePassword = props.mustChangePassword;
    this._inviteToken = props.inviteToken;
    this._inviteTokenExpiry = props.inviteTokenExpiry;
    this._lastLoginAt = props.lastLoginAt;
  }

  // ============================================
  // Getters
  // ============================================

  get email(): Email {
    return this._email;
  }

  get username(): string | undefined {
    return this._username;
  }

  get passwordHash(): Password {
    return this._passwordHash;
  }

  get fullName(): string {
    return this._fullName;
  }

  get avatar(): string | undefined {
    return this._avatar;
  }

  get bio(): string | undefined {
    return this._bio;
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): UserStatus {
    return this._status;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  get onboardingCompleted(): boolean {
    return this._onboardingCompleted;
  }

  get mustChangePassword(): boolean {
    return this._mustChangePassword;
  }

  get inviteToken(): string | undefined {
    return this._inviteToken;
  }

  get inviteTokenExpiry(): Date | undefined {
    return this._inviteTokenExpiry;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  // ============================================
  // Factory Methods
  // ============================================

  /**
   * Create a new user (registration)
   */
  static create(props: CreateUserProps): User {
    const id = UserId.create();
    const email = Email.create(props.email);
    const passwordHash = Password.createFromHashed(props.passwordHash);
    const role = UserRole.create(props.role ?? UserRoleEnum.STUDENT);
    const status = UserStatus.active();

    const user = new User(id, {
      email,
      username: props.username,
      passwordHash,
      fullName: props.fullName,
      role,
      status,
      emailVerified: false,
      onboardingCompleted: false,
      mustChangePassword: props.mustChangePassword ?? false,
      inviteToken: props.inviteToken,
      inviteTokenExpiry: props.inviteTokenExpiry,
    });

    user.addDomainEvent(
      new UserRegisteredEvent(
        id.value,
        email.value,
        props.fullName,
        role.value,
      ),
    );

    return user;
  }

  /**
   * Restore user from persistence (database)
   */
  static restore(props: RestoreUserProps): User {
    const id = UserId.create(props.id);
    const email = Email.create(props.email);
    const passwordHash = Password.createFromHashed(props.passwordHash);
    const role = UserRole.create(props.role);
    const status = UserStatus.create(props.status);

    return new User(
      id,
      {
        email,
        username: props.username,
        passwordHash,
        fullName: props.fullName,
        avatar: props.avatar,
        bio: props.bio,
        role,
        status,
        emailVerified: props.emailVerified,
        onboardingCompleted: props.onboardingCompleted,
        mustChangePassword: props.mustChangePassword,
        inviteToken: props.inviteToken,
        inviteTokenExpiry: props.inviteTokenExpiry,
        lastLoginAt: props.lastLoginAt,
      },
      props.createdAt,
      props.updatedAt,
    );
  }

  // ============================================
  // Business Methods
  // ============================================

  /**
   * Verify user email
   */
  verifyEmail(): void {
    if (this._emailVerified) {
      return; // Already verified
    }

    this._emailVerified = true;
    this.touch();

    this.addDomainEvent(
      new UserVerifiedEvent(this.id.value, this._email.value),
    );
  }

  /**
   * Change password
   */
  changePassword(newPasswordHash: string): void {
    this._passwordHash = Password.createFromHashed(newPasswordHash);
    this._mustChangePassword = false; // Clear flag after password change
    this.touch();

    this.addDomainEvent(
      new PasswordChangedEvent(this.id.value, this._email.value),
    );
  }

  /**
   * Set must change password flag
   */
  setMustChangePassword(value: boolean): void {
    this._mustChangePassword = value;
    this.touch();
  }

  /**
   * Set invite token for first-time password setup
   */
  setInviteToken(token: string, expiryHours: number = 72): void {
    this._inviteToken = token;
    this._inviteTokenExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    this.touch();
  }

  /**
   * Clear invite token after password is set
   */
  clearInviteToken(): void {
    this._inviteToken = undefined;
    this._inviteTokenExpiry = undefined;
    this.touch();
  }

  /**
   * Check if invite token is valid
   */
  isInviteTokenValid(token: string): boolean {
    if (!this._inviteToken || !this._inviteTokenExpiry) {
      return false;
    }
    return this._inviteToken === token && this._inviteTokenExpiry > new Date();
  }

  /**
   * Update profile information
   */
  updateProfile(data: {
    fullName?: string;
    username?: string;
    avatar?: string;
    bio?: string;
  }): void {
    if (data.fullName !== undefined) {
      this._fullName = data.fullName;
    }
    if (data.username !== undefined) {
      this._username = data.username;
    }
    if (data.avatar !== undefined) {
      this._avatar = data.avatar;
    }
    if (data.bio !== undefined) {
      this._bio = data.bio;
    }
    this.touch();
  }

  /**
   * Complete onboarding
   */
  completeOnboarding(): void {
    this._onboardingCompleted = true;
    this.touch();
  }

  /**
   * Record login
   */
  recordLogin(ipAddress?: string, userAgent?: string): void {
    this._lastLoginAt = new Date();
    this.touch();

    this.addDomainEvent(
      new UserLoggedInEvent(
        this.id.value,
        this._email.value,
        ipAddress,
        userAgent,
      ),
    );
  }

  /**
   * Deactivate user account
   */
  deactivate(reason?: string): void {
    this._status = UserStatus.inactive();
    this.touch();

    this.addDomainEvent(
      new UserDeactivatedEvent(this.id.value, this._email.value, reason),
    );
  }

  /**
   * Suspend user account
   */
  suspend(): void {
    this._status = UserStatus.suspended();
    this.touch();
  }

  /**
   * Reactivate user account
   */
  reactivate(): void {
    this._status = UserStatus.active();
    this.touch();
  }

  /**
   * Change user role
   */
  changeRole(newRole: UserRoleEnum): void {
    this._role = UserRole.create(newRole);
    this.touch();
  }

  // ============================================
  // Query Methods
  // ============================================

  canLogin(): boolean {
    return this._status.canLogin();
  }

  isAdmin(): boolean {
    return this._role.hasAdminAccess();
  }
}
