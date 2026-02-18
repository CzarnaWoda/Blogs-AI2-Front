<div align="center">

# 🖥️ Blogs-AI2 Frontend

**Angular 21 SPA client for the Blogs-AI2 platform**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SSR](https://img.shields.io/badge/SSR-Angular%20Universal-red?style=for-the-badge&logo=angular)](https://angular.io/guide/ssr)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Routing & Guards](#-routing--guards)
- [State Management](#-state-management)
- [Services](#-services)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Backend Integration](#-backend-integration)

---

## 📖 Overview

**Blogs-AI2 Frontend** is the Angular 21 SPA client for the [Blogs-AI2 REST API](https://github.com/CzarnaWoda/Blogs-AI2). It provides a full blog experience with role-based UI, dark/light theme switching, bilingual support (PL/EN), and SSR (Server-Side Rendering) via Angular Universal.

The application consumes all REST endpoints exposed by the backend, handles JWT authentication transparently via an HTTP interceptor, and enforces role-based access both on the routing level (guards) and in the UI (conditional rendering).

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | Angular 21 (standalone components) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-angular 0.555 |
| SSR | @angular/ssr + Express 5 |
| HTTP | Angular `HttpClient` + functional interceptors |
| Reactivity | Angular Signals (`signal`, `effect`, `computed`) |
| Testing | Vitest |
| Build | Angular CLI 21 / @angular/build |

---

## 🏛 Architecture

The project follows a **feature-based architecture** with a clearly separated core layer:

```
src/app/
├── core/           # Singleton services, models, guards, interceptors
├── features/       # Feature modules (articles, sections, auth, profile, admin)
└── shared/         # Reusable UI components (navbar, toast)
```

### Standalone Components

All components are built as **standalone Angular 21 components** — no NgModules. Each component declares its own imports, making them fully self-contained and tree-shakeable.

### Signals-based State

Services use Angular **Signals** for reactive state management instead of BehaviorSubjects/RxJS-heavy patterns. This allows direct signal reads in templates via `computed` and `effect`, with zero-boilerplate subscriptions.

```typescript
// Service exposes read-only signal
private articlesSignal = signal<ArticleDto[]>([]);
get articles() { return this.articlesSignal.asReadonly(); }

// Template reads signal directly
articles = this.articleService.articles;
```

---

## ✨ Features

### User-facing
- Browse and search **blog sections** (categories)
- Read **articles** with view tracking, likes, and comments
- **Register** and **login** with JWT token persistence
- **User profile** — update username, phone number, change password
- **Public user profiles** — view articles authored by any user

### Moderator / Admin
- **Create and edit articles** within sections
- **Create new sections** (admin only)
- **Admin panel** — user management table with email/role filtering, role assignment and revocation, platform statistics (total users, sections, articles, views)

### UX Features
- **Dark / Light theme** toggle — persisted in `localStorage`, respects system preference on first visit
- **Bilingual UI** — Polish and English, switchable at runtime via built-in `I18nService` (no external i18n library)
- **Toast notifications** — non-blocking success/error feedback for all operations
- **SSR (Server-Side Rendering)** — rendered on the server via Angular Universal for faster initial load and SEO

---

## 🔀 Routing & Guards

```
/                       → redirect to /sections
/login                  → LoginComponent           (public)
/register               → RegisterComponent        (public)
/sections               → SectionsListComponent    (public)
/sections/create        → SectionCreateComponent   [roleGuard: ADMIN]
/sections/:id           → ArticleListComponent     (public)
/articles/create        → ArticleCreateComponent   [roleGuard: ADMIN | MODERATOR]
/articles/edit/:id      → ArticleEditComponent     [roleGuard: ADMIN | MODERATOR]
/articles/:id           → ArticleDetailComponent   (public)
/profile                → ProfileComponent         [authGuard]
/profile/:userName      → UserProfileComponent     [authGuard]
/admin                  → AdminComponent           [roleGuard: ADMIN]
**                      → redirect to /sections
```

All routes use **lazy-loaded** components via `loadComponent()` for optimal initial bundle size.

### Guards

**`authGuard`** — Verifies the user is authenticated (JWT token present). Redirects to `/login` if not.

**`roleGuard`** — Verifies the authenticated user holds at least one of the required roles declared in route `data.roles`. Redirects to `/` if the role requirement is not met.

```typescript
{
  path: 'admin',
  canActivate: [roleGuard],
  data: { roles: [UserRole.ADMIN] },
  loadComponent: () => import('./features/admin/admin.component')...
}
```

---

## 🧠 State Management

The application uses **Angular Signals** as the primary reactive state primitive — no NgRx or external store.

| Service | Signal | Description |
|---|---|---|
| `AuthService` | `currentUserSignal` | Currently logged-in user (`UserDto \| null`) |
| `ArticleService` | `articlesSignal` | Cached article list for the current view |
| `ThemeService` | `themeSignal` | Active theme (`'light' \| 'dark'`) |
| `I18nService` | `currentLanguageSignal` | Active language (`'pl' \| 'en'`) |
| `ToastService` | internal signal | Toast notification queue |

State is persisted to `localStorage` where applicable (auth token, user data, theme preference, language preference).

---

## 🔧 Services

### `AuthService`
Handles login, registration, logout, token storage, and current user state. Exposes `hasRole(role)` and `hasAnyRole(roles[])` for role checks across the app.

### `ArticleService`
Full CRUD for articles — get (by id, title, author, section), create, update, like, disable, count. Keeps a local signal cache updated after mutations.

### `SectionService`
Fetches sections (paginated, by type, by id), creates and updates sections.

### `CommentService`
Fetches comments by article, creates comments, likes and disables comments.

### `UserService`
Fetches user profiles, paginates user lists, filters by email/role, updates profiles, manages role assignment (add/remove).

### `ThemeService`
Manages dark/light theme. Applies the theme class to `document.documentElement` and persists preference. Reads `prefers-color-scheme` on first visit.

### `I18nService`
Lightweight built-in i18n with a compile-time `Translations` dictionary. Supports PL and EN. Provides a `t(key: string): string` method used directly in templates.

### `ToastService`
Manages a queue of toast messages (`success` / `error` / `info`) shown by the global `ToastContainerComponent`.

### `JwtInterceptor` (functional)
Automatically attaches the `Authorization: Bearer <token>` header to every outgoing HTTP request when a token is present in storage.

```typescript
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 11+
- Running instance of [Blogs-AI2 backend](https://github.com/CzarnaWoda/Blogs-AI2) on `localhost:8080`

### 1. Clone the repository

```bash
git clone https://github.com/CzarnaWoda/Blogs-AI2-Front.git
cd Blogs-AI2-Front
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API base URL

The backend URL is currently hardcoded in each service (`http://localhost:8080/api/v1/...`). For environment-specific configuration, update the relevant service files or introduce Angular `environment.ts` files.

### 4. Start the development server

```bash
npm start
# or
ng serve
```

Application will be available at **`http://localhost:4200`**.

### 5. Build for production

```bash
npm run build
```

### 6. Run with SSR (Server-Side Rendering)

```bash
npm run build
npm run serve:ssr:Blogs-AI
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Redirects unauthenticated users
│   │   │   └── role.guard.ts           # Redirects users without required role
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts      # Attaches Bearer token to all requests
│   │   ├── models/
│   │   │   ├── user.model.ts           # UserDto, UserRole enum, request interfaces
│   │   │   ├── article.model.ts        # ArticleDto, CreateArticleRequest, ...
│   │   │   ├── section.model.ts        # SectionDto, CreateSectionRequest, ...
│   │   │   └── comment.model.ts        # CommentDto, CreateCommentRequest, ...
│   │   └── services/
│   │       ├── auth.service.ts         # Login, register, token, currentUser signal
│   │       ├── article.service.ts      # Article CRUD + signals cache
│   │       ├── section.service.ts      # Section operations
│   │       ├── comment.service.ts      # Comment operations
│   │       ├── user.service.ts         # User management
│   │       ├── theme.service.ts        # Dark/light theme signal
│   │       ├── i18n.service.ts         # PL/EN translations + language signal
│   │       └── toast.service.ts        # Toast notification queue
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login.component.ts      # Login form
│   │   │   └── register.component.ts   # Registration form
│   │   ├── articles/
│   │   │   ├── article-list.component.ts    # Articles within a section
│   │   │   ├── article-detail.component.ts  # Full article + comments
│   │   │   ├── article-create.component.ts  # Create article form [MODERATOR+]
│   │   │   └── article-edit.component.ts    # Edit article form [MODERATOR+]
│   │   ├── sections/
│   │   │   ├── sections-list.component.ts   # All sections (home page)
│   │   │   └── section-create.component.ts  # Create section form [ADMIN]
│   │   ├── profile/
│   │   │   ├── profile.component.ts         # Own profile settings
│   │   │   └── user-profile.component.ts    # Public user profile view
│   │   └── admin/
│   │       └── admin.component.ts           # Admin panel (users + stats)
│   │
│   ├── shared/
│   │   └── components/
│   │       ├── navbar.component.ts          # Top navigation bar
│   │       └── toast-container.component.ts # Global toast display
│   │
│   ├── app.routes.ts           # Route definitions with lazy loading & guards
│   ├── app.config.ts           # Application providers (router, http, animations)
│   └── app.ts                  # Root component
│
├── styles.css                  # Global Tailwind CSS imports
└── index.html                  # HTML entry point
```

---

## 🔗 Backend Integration

This frontend is designed to work exclusively with the **Blogs-AI2 Spring Boot backend**.

| Frontend Port | Backend Port | Notes |
|---|---|---|
| `4200` (dev) | `8080` | Default development setup |
| `4201` | `8080` | Alternative frontend port (configured in backend CORS) |
| `88` | `8080` | Additional CORS-whitelisted origin |

The backend must have the corresponding CORS origins configured in `application.properties`:

```properties
frontend.origin-pattern-properties[0].address=localhost
frontend.origin-pattern-properties[0].https=false
frontend.origin-pattern-properties[0].port=4200
```

See the [Blogs-AI2 backend README](https://github.com/CzarnaWoda/Blogs-AI2) for full backend setup instructions.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss the proposed modification.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
