import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { UserRole } from './core/models';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sections',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'sections',
    loadComponent: () =>
      import('./features/sections/sections-list.component').then(m => m.SectionsListComponent)
  },
  {
    path: 'sections/create',
    canActivate: [roleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadComponent: () =>
      import('./features/sections/section-create.component').then(m => m.SectionCreateComponent)
  },
  {
    path: 'sections/:id',
    loadComponent: () =>
      import('./features/articles/article-list.component').then(m => m.ArticleListComponent)
  },
  {
    path: 'articles/create',
    canActivate: [roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    loadComponent: () =>
      import('./features/articles/article-create.component').then(m => m.ArticleCreateComponent)
  },
  {
    path: 'articles/edit/:id',
    canActivate: [roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    loadComponent: () =>
      import('./features/articles/article-edit.component').then(m => m.ArticleEditComponent)
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('./features/articles/article-detail.component').then(m => m.ArticleDetailComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'profile/:userName',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadComponent: () =>
      import('./features/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: '**',
    redirectTo: 'sections'
  }
];
