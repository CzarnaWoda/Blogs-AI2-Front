import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, SectionService, ArticleService, AuthService, I18nService } from '../../core/services';
import { UserDto, UserRole } from '../../core/models';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>{{ i18n.t('admin.title') }}</h1>

      <div class="tabs">
        <button
          [class.active]="activeTab() === 'users'"
          (click)="activeTab.set('users')"
          class="tab"
          type="button"
        >
          {{ i18n.t('admin.users') }}
        </button>
        @if (authService.hasRole(UserRole.ADMIN)) {
          <button
            [class.active]="activeTab() === 'stats'"
            (click)="activeTab.set('stats')"
            class="tab"
            type="button"
          >
            {{ i18n.t('admin.stats') }}
          </button>
        }
      </div>

      @if (activeTab() === 'users') {
        <div class="users-section">
          <h2>{{ i18n.t('admin.userManagement') }}</h2>

          <div class="filters">
            <div class="filter-group">
              <label for="searchEmail">{{ i18n.t('admin.searchByEmail') }}</label>
              <input
                id="searchEmail"
                type="text"
                [(ngModel)]="filterEmail"
                [placeholder]="i18n.t('admin.enterEmail')"
                class="filter-input"
              />
            </div>

            <div class="filter-group">
              <label for="filterRole">{{ i18n.t('admin.filterByRole') }}</label>
              <select
                id="filterRole"
                [(ngModel)]="filterRole"
                class="filter-select"
              >
                <option value="">{{ i18n.t('admin.allRoles') }}</option>
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
                <option value="HELPER">Helper</option>
                <option value="USER">User</option>
              </select>
            </div>

            <div class="filter-actions">
              <button (click)="applyFilters()" class="btn btn-primary" type="button">
                {{ i18n.t('admin.applyFilters') }}
              </button>
              <button (click)="clearFilters()" class="btn btn-secondary" type="button">
                {{ i18n.t('admin.clear') }}
              </button>
            </div>
          </div>

          <div class="users-table">
            <table>
              <thead>
                <tr>
                  <th>{{ i18n.t('admin.username') }}</th>
                  <th>{{ i18n.t('admin.email') }}</th>
                  <th>{{ i18n.t('admin.phone') }}</th>
                  <th>{{ i18n.t('admin.roles') }}</th>
                  @if (authService.hasRole(UserRole.ADMIN)) {
                    <th>{{ i18n.t('admin.actions') }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.email) {
                  <tr>
                    <td>{{ user.userName }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.phone }}</td>
                    <td>
                      <div class="roles-list">
                        @for (role of user.userRoles; track role) {
                          <span class="role-badge">{{ role }}</span>
                        }
                      </div>
                    </td>
                    @if (authService.hasRole(UserRole.ADMIN)) {
                      <td>
                        <button
                          (click)="editUserRoles(user)"
                          class="btn-small"
                          type="button"
                        >
                          {{ i18n.t('admin.editRoles') }}
                        </button>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (activeTab() === 'stats') {
        <div class="stats-section">
          <h2>{{ i18n.t('admin.stats') }}</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ sections().length }}</div>
              <div class="stat-label">{{ i18n.t('admin.totalSections') }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ articles().length }}</div>
              <div class="stat-label">{{ i18n.t('admin.totalArticles') }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ users().length }}</div>
              <div class="stat-label">{{ i18n.t('admin.totalUsers') }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ getTotalViews() }}</div>
              <div class="stat-label">{{ i18n.t('admin.totalViews') }}</div>
            </div>
          </div>
        </div>
      }
    </div>

    @if (editingUser()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ i18n.t('admin.editUserRoles') }}</h3>
          <p>{{ editingUser()?.userName }} ({{ editingUser()?.email }})</p>

          <div class="role-checkboxes">
            @for (role of availableRoles; track role) {
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [checked]="selectedRoles().includes(role)"
                  (change)="toggleRole(role)"
                />
                {{ role }}
              </label>
            }
          </div>

          <div class="modal-actions">
            <button (click)="saveUserRoles()" class="btn btn-primary" type="button">
              {{ i18n.t('admin.save') }}
            </button>
            <button (click)="closeModal()" class="btn btn-secondary" type="button">
              {{ i18n.t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    h1 {
      color: var(--text-primary);
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
    }

    h2 {
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid var(--border-color);
    }

    .tab {
      background: none;
      border: none;
      padding: 0.75rem 1.5rem;
      color: var(--text-secondary);
      font-weight: 600;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--text-primary);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .users-section, .stats-section {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 2rem;
    }

    .users-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    th {
      color: var(--text-primary);
      font-weight: 600;
      background: var(--bg-secondary);
    }

    td {
      color: var(--text-primary);
    }

    .roles-list {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .role-badge {
      background: var(--primary-bg);
      color: var(--primary-color);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .btn-small {
      padding: 0.375rem 0.75rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 1.5rem;
      text-align: center;
    }

    .stat-value {
      color: var(--primary-color);
      font-size: 2.5rem;
      font-weight: 700;
    }

    .stat-label {
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
    }

    .modal h3 {
      color: var(--text-primary);
      margin: 0 0 1rem 0;
    }

    .modal p {
      color: var(--text-secondary);
      margin: 0 0 1.5rem 0;
    }

    .role-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-primary);
      cursor: pointer;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .filters {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.875rem;
    }

    .filter-input,
    .filter-select {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .filter-input:focus,
    .filter-select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-bg);
    }

    .filter-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .filter-actions .btn {
      width: 100%;
    }

    @media (max-width: 768px) {
      .filters {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  authService = inject(AuthService);
  private userService = inject(UserService);
  private sectionService = inject(SectionService);
  private articleService = inject(ArticleService);
  i18n = inject(I18nService);

  activeTab = signal<'users' | 'stats'>('users');
  users = signal<UserDto[]>([]);
  filteredUsers = signal<UserDto[]>([]);
  sections = signal<any[]>([]);
  articles = signal<any[]>([]);

  editingUser = signal<UserDto | null>(null);
  selectedRoles = signal<string[]>([]);

  // Filter properties
  filterEmail = '';
  filterRole = '';

  availableRoles = [UserRole.USER, UserRole.HELPER, UserRole.MODERATOR, UserRole.ADMIN];
  UserRole = UserRole;

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers.set(users);
      }
    });
  }

  loadStats(): void {
    this.sectionService.getSections(0, 1000).subscribe({
      next: (response) => this.sections.set(response.sections)
    });
    this.articleService.getArticles(0, 1000).subscribe({
      next: (response) => this.articles.set(response.articles)
    });
  }

  getTotalViews(): number {
    return this.sections().reduce((sum, s) => sum + s.views, 0) +
           this.articles().reduce((sum, a) => sum + a.views, 0);
  }

  editUserRoles(user: UserDto): void {
    this.editingUser.set(user);
    this.selectedRoles.set([...user.userRoles]);
  }

  toggleRole(role: string): void {
    const current = this.selectedRoles();
    if (current.includes(role)) {
      this.selectedRoles.set(current.filter(r => r !== role));
    } else {
      this.selectedRoles.set([...current, role]);
    }
  }

  saveUserRoles(): void {
    const user = this.editingUser();
    if (!user) return;

    const currentRoles = user.userRoles;
    const newRoles = this.selectedRoles();

    // Find roles to add and remove
    const rolesToAdd = newRoles.filter(r => !currentRoles.includes(r));
    const rolesToRemove = currentRoles.filter(r => !newRoles.includes(r));

    // Execute role changes sequentially
    const addRoleObservables = rolesToAdd.map(role =>
      this.userService.addRole(user.userName, role)
    );
    const removeRoleObservables = rolesToRemove.map(role =>
      this.userService.removeRole(user.userName, role)
    );

    // Combine all operations
    const allOperations = [...addRoleObservables, ...removeRoleObservables];

    if (allOperations.length === 0) {
      this.closeModal();
      return;
    }

    // Execute first operation, then load users
    allOperations[0].subscribe({
      next: () => {
        // Execute remaining operations if any
        if (allOperations.length > 1) {
          let completed = 0;
          allOperations.slice(1).forEach(obs => {
            obs.subscribe({
              next: () => {
                completed++;
                if (completed === allOperations.length - 1) {
                  this.loadUsers();
                  this.closeModal();
                }
              }
            });
          });
        } else {
          this.loadUsers();
          this.closeModal();
        }
      }
    });
  }

  closeModal(): void {
    this.editingUser.set(null);
    this.selectedRoles.set([]);
  }

  applyFilters(): void {
    // If both filters are empty, load all users
    if (!this.filterEmail && !this.filterRole) {
      this.loadUsers();
      return;
    }

    // Use backend filtering
    if (this.filterEmail && this.filterRole) {
      // Filter by both email and role
      this.userService.getUsersByEmailAndRole(this.filterEmail, this.filterRole).subscribe({
        next: (response) => {
          this.filteredUsers.set(response.users);
        },
        error: (error) => {
          console.error('Filter error:', error);
          this.filteredUsers.set([]);
        }
      });
    } else if (this.filterEmail) {
      // Filter by email only
      this.userService.getUsersByEmail(this.filterEmail).subscribe({
        next: (response) => {
          this.filteredUsers.set(response.users);
        },
        error: (error) => {
          console.error('Filter error:', error);
          this.filteredUsers.set([]);
        }
      });
    } else if (this.filterRole) {
      // Filter by role only
      this.userService.getUsersByRole(this.filterRole).subscribe({
        next: (response) => {
          this.filteredUsers.set(response.users);
        },
        error: (error) => {
          console.error('Filter error:', error);
          this.filteredUsers.set([]);
        }
      });
    }
  }

  clearFilters(): void {
    this.filterEmail = '';
    this.filterRole = '';
    this.loadUsers();
  }
}
