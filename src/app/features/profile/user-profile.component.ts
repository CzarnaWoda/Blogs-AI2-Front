import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService, I18nService, ArticleService } from '../../core/services';
import { UserDto } from '../../core/models';
import { LucideAngularModule, FileText, Calendar, Mail, Phone } from 'lucide-angular';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="container">
      @if (user(); as user) {
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-gradient">
              <div class="avatar">
                {{ user.userName.charAt(0).toUpperCase() }}
              </div>
            </div>
            <h1 class="user-name">{{ user.userName }}</h1>
            <p class="user-email">{{ user.email }}</p>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-icon">
                <lucide-icon [img]="FileTextIcon" [size]="32"></lucide-icon>
              </div>
              <div class="stat-value">{{ getPostCount() }}</div>
              <div class="stat-label">{{ i18n.t('profile.posts') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <lucide-icon [img]="CalendarIcon" [size]="32"></lucide-icon>
              </div>
              <div class="stat-value">{{ i18n.t('profile.joined') }}</div>
              <div class="stat-label">{{ getJoinedDate() }}</div>
            </div>
          </div>

          <div class="profile-section">
            <h3>{{ i18n.t('profile.roles') }}</h3>
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
          </div>

          <div class="profile-section">
            <h3>{{ i18n.currentLanguage() === 'pl' ? 'Informacje Kontaktowe' : 'Contact Information' }}</h3>
            <div class="info-list">
              <div class="info-item">
                <span class="info-icon">
                  <lucide-icon [img]="MailIcon" [size]="24"></lucide-icon>
                </span>
                <span class="info-label">Email:</span>
                <span class="info-value">{{ user.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">
                  <lucide-icon [img]="PhoneIcon" [size]="24"></lucide-icon>
                </span>
                <span class="info-label">{{ i18n.currentLanguage() === 'pl' ? 'Telefon:' : 'Phone:' }}</span>
                <span class="info-value">{{ user.phone }}</span>
              </div>
            </div>
          </div>
        </div>
      } @else if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>{{ i18n.t('common.loading') }}</p>
        </div>
      } @else {
        <div class="not-found">
          <p>{{ i18n.currentLanguage() === 'pl' ? 'Użytkownik nie znaleziony' : 'User not found' }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      min-height: calc(100vh - 80px);
    }

    .profile-card {
      background: var(--bg-primary);
      border-radius: 1.5rem;
      box-shadow: var(--shadow-xl);
      overflow: hidden;
    }

    .profile-header {
      background: var(--gradient-primary);
      padding: 3rem 2rem 2rem;
      text-align: center;
      position: relative;
    }

    .profile-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="%23ffffff"></path></svg>') no-repeat bottom;
      background-size: cover;
      opacity: 0.1;
    }

    .avatar-gradient {
      display: inline-block;
      padding: 4px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
      margin-bottom: 1rem;
    }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 700;
      color: var(--primary-color);
      box-shadow: var(--shadow-lg);
    }

    .user-name {
      color: white;
      font-size: 2rem;
      font-weight: 700;
      margin: 0.5rem 0 0.25rem;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .user-email {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.1rem;
      margin: 0;
    }

    .profile-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
      background: var(--bg-secondary);
    }

    .stat-item {
      text-align: center;
      padding: 1.5rem;
      background: var(--bg-primary);
      border-radius: 1rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
    }

    .stat-item:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .stat-icon lucide-icon {
      display: inline-flex;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .profile-section {
      padding: 2rem;
      border-top: 1px solid var(--border-color);
    }

    .profile-section h3 {
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1.5rem;
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

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 0.75rem;
      transition: all 0.2s ease;
    }

    .info-item:hover {
      background: var(--bg-tertiary);
    }

    .info-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .info-icon lucide-icon {
      display: inline-flex;
    }

    .info-label {
      color: var(--text-secondary);
      font-weight: 600;
      min-width: 80px;
    }

    .info-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .loading,
    .not-found {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }

    .spinner {
      width: 50px;
      height: 50px;
      margin: 0 auto 1rem;
      border: 4px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .profile-stats {
        grid-template-columns: 1fr;
      }

      .info-item {
        flex-direction: column;
        align-items: flex-start;
      }

      .info-label {
        min-width: auto;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private userService = inject(UserService);
  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);
  i18n = inject(I18nService);

  user = signal<UserDto | null>(null);
  loading = signal(true);
  postCount = signal<number>(0);

  // Lucide icons
  readonly FileTextIcon = FileText;
  readonly CalendarIcon = Calendar;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;

  ngOnInit(): void {
    const userName = this.route.snapshot.paramMap.get('userName');
    if (userName) {
      this.loadUser(userName);
    } else {
      this.loading.set(false);
    }
  }

  loadUser(userName: string): void {
    this.userService.getUserByUserName(userName).subscribe({
      next: (user) => {
        this.user.set(user || null);
        this.loading.set(false);

        // Load article count if user has userName
        if (user?.userName) {
          this.articleService.getArticleCountByAuthor(user.userName).subscribe({
            next: (count) => this.postCount.set(count),
            error: () => this.postCount.set(0)
          });
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getPostCount(): number {
    return this.postCount();
  }

  getJoinedDate(): string {
    const user = this.user();
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString();
    }
    return '2024';
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
