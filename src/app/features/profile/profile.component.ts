import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserService, I18nService } from '../../core/services';
import { UpdateUserRequest, ChangePasswordRequest } from '../../core/models';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>{{ i18n.t('profile.title') }}</h1>

      @if (authService.currentUser(); as user) {
        <div class="profile-sections">
          <section class="profile-section">
            <h2>{{ i18n.t('profile.personalInfo') }}</h2>
            <form (ngSubmit)="updateProfile()" class="profile-form">
              <div class="form-group">
                <label for="userName">{{ i18n.t('profile.username') }}</label>
                <input
                  id="userName"
                  type="text"
                  [(ngModel)]="userName"
                  name="userName"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="email">{{ i18n.t('register.email') }}</label>
                <input
                  id="email"
                  type="email"
                  [value]="user.email"
                  disabled
                  class="form-control"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="countryCode">{{ i18n.t('profile.countryCode') }}</label>
                  <input
                    id="countryCode"
                    type="text"
                    [(ngModel)]="countryCode"
                    name="countryCode"
                    placeholder="+48"
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label for="phoneNumber">{{ i18n.t('profile.phone') }}</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    [(ngModel)]="phoneNumber"
                    name="phoneNumber"
                    class="form-control"
                  />
                </div>
              </div>

              @if (profileMessage()) {
                <div class="alert alert-success">{{ profileMessage() }}</div>
              }

              <button type="submit" class="btn btn-primary">
                {{ i18n.t('profile.updateProfile') }}
              </button>
            </form>
          </section>

          <section class="profile-section">
            <h2>{{ i18n.t('profile.changePassword') }}</h2>
            <form (ngSubmit)="changePassword()" class="profile-form">
              <div class="form-group">
                <label for="currentPassword">{{ i18n.t('profile.currentPassword') }}</label>
                <input
                  id="currentPassword"
                  type="password"
                  [(ngModel)]="currentPassword"
                  name="currentPassword"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="newPassword">{{ i18n.t('profile.newPassword') }}</label>
                <input
                  id="newPassword"
                  type="password"
                  [(ngModel)]="newPassword"
                  name="newPassword"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="confirmPassword">{{ i18n.t('profile.confirmPassword') }}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  class="form-control"
                />
              </div>

              @if (passwordMessage()) {
                <div class="alert alert-success">{{ passwordMessage() }}</div>
              }

              <button type="submit" class="btn btn-primary">
                {{ i18n.t('profile.changePassword') }}
              </button>
            </form>
          </section>

          <section class="profile-section">
            <h2>{{ i18n.t('profile.roles') }}</h2>
            <div class="roles-list">
              @for (role of user.userRoles; track role) {
                <div class="role-circle" [class]="'role-' + role.toLowerCase()">
                  {{ getRoleInitial(role) }}
                </div>
              }
            </div>
            <div class="roles-legend">
              <div class="legend-item">
                <div class="role-circle role-admin">A</div>
                <span>Admin</span>
              </div>
              <div class="legend-item">
                <div class="role-circle role-moderator">M</div>
                <span>Moderator</span>
              </div>
              <div class="legend-item">
                <div class="role-circle role-helper">H</div>
                <span>Helper</span>
              </div>
              <div class="legend-item">
                <div class="role-circle role-user">U</div>
                <span>User</span>
              </div>
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    h1 {
      color: var(--text-primary);
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
    }

    .profile-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .profile-section {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 2rem;
    }

    .profile-section h2 {
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.875rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1rem;
    }

    .form-control:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      align-self: flex-start;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
    }

    .roles-list {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .role-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
      color: white;
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
    }

    .role-circle:hover {
      transform: translateY(-4px) scale(1.1);
      box-shadow: var(--shadow-lg);
    }

    .role-admin {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    }

    .role-moderator {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    }

    .role-helper {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    }

    .role-user {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    }

    .roles-legend {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      padding: 1.5rem;
      background: var(--bg-secondary);
      border-radius: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .legend-item .role-circle {
      width: 35px;
      height: 35px;
      font-size: 1rem;
    }

    .legend-item span {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.875rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private userService = inject(UserService);
  i18n = inject(I18nService);

  userName = '';
  countryCode = '';
  phoneNumber = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  profileMessage = signal('');
  passwordMessage = signal('');

  ngOnInit(): void {
    // Fetch fresh user data from /me endpoint
    this.authService.getMe().subscribe({
      next: (user) => {
        this.userName = user.userName;
        const phone = user.phone;
        this.countryCode = phone.substring(0, 3);
        this.phoneNumber = phone.substring(3);
      },
      error: () => {
        // Fallback to cached user if /me fails
        const user = this.authService.currentUser();
        if (user) {
          this.userName = user.userName;
          const phone = user.phone;
          this.countryCode = phone.substring(0, 3);
          this.phoneNumber = phone.substring(3);
        }
      }
    });
  }

  updateProfile(): void {
    const request: UpdateUserRequest = {
      userName: this.userName,
      countryCode: this.countryCode,
      phoneNumber: this.phoneNumber
    };

    this.userService.updateUser(request).subscribe({
      next: () => {
        // Refresh user data from /me endpoint to update navbar and other components
        this.authService.getMe().subscribe({
          next: (user) => {
            this.userName = user.userName;
            const phone = user.phone;
            this.countryCode = phone.substring(0, 3);
            this.phoneNumber = phone.substring(3);
            this.profileMessage.set(this.i18n.t('toast.profileUpdated'));
            setTimeout(() => this.profileMessage.set(''), 3000);
          }
        });
      }
    });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMessage.set(this.i18n.currentLanguage() === 'pl' ? 'Hasła nie są identyczne!' : 'Passwords do not match!');
      return;
    }

    const request: ChangePasswordRequest = {
      oldPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.authService.changePassword(request).subscribe({
      next: () => {
        this.passwordMessage.set(this.i18n.t('toast.passwordChanged'));
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.passwordMessage.set(''), 3000);
      }
    });
  }

  getRoleInitial(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'A',
      'MODERATOR': 'M',
      'HELPER': 'H',
      'USER': 'U'
    };
    return roleMap[role] || role.charAt(0).toUpperCase();
  }
}
