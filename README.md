# TaskFlow CRM

TaskFlow CRM is a production-grade, single-page client application built using **React 19**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS v4**. It features high-quality dashboard telemetry, custom JWT mock authentication with automatic token refreshing, drag-and-drop Kanban workflow automation, role-based client routing permission rules, optimistic CRUD states, skeleton screen placeholders, and error boundaries.

---

## 🏗️ Architecture Design & Layers

TaskFlow CRM adheres to a modular, decoupled architecture, separating visual representations from state orchestrators and API network logic:

```text
                               +-----------------------------+
                               |    UI & Presentation Layer  |
                               |  (React 19 / Tailwind v4)   |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |   RBAC Permission Wrapper   |
                               |      (Can.tsx / Hooks)      |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |     State Management Layer  |
                               |    (Redux Toolkit / RTK)    |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |    API Interceptor Service  |
                               |      (Axios JWT Client)     |
                               +--------------+--------------+
                                              |
                                              v
                               +-----------------------------+
                               |   Backend & Database Node   |
                               | (Express Server + db.json)  |
                               +-----------------------------+
```

### 1. Presentation Layer (`src/pages`, `src/components`)
- **Dashboard Overview**: Telemetry metrics calculated via memoized selectors, workload metrics, and recent activities.
- **Kanban Board**: Drag-and-drop tasks columns utilizing `@dnd-kit/core` and `@dnd-kit/sortable`.
- **User Directory**: Centralized team registry table containing CRUD capabilities and access role scope assignments.
- **ErrorBoundary**: A class-based React component wrapping the application tree to catch and handle rendering lifecycle exceptions gracefully.

### 2. RBAC Permission Security (`src/hooks/usePermissions.ts`, `src/components/auth/Can.tsx`)
- Provides action-level, component-level, and route-level protection based on matching roles (`ADMIN`, `MANAGER`, `USER`).
- Unauthorized UI features are automatically blocked, disabled, or hidden.

### 3. Redux Store Logic (`src/store`)
- Splitted into distinct, decoupled slices (`authSlice`, `userSlice`, `taskSlice`, `activitySlice`).
- Optimistic updates are integrated into CRUD tasks and user states, with automatic cache rollbacks if API calls fail.

### 4. API Client Layer (`src/services/api/apiClient.ts`)
- Features an Axios interceptor that automatically attaches access tokens, captures `401 Unauthorized` responses, and negotiates silent refresh tokens.

### 5. Backend Server (`server.cjs` & `db.json`)
- A custom Node-based Express script wrapping `json-server` that implements mock password hashing, JWT token signatures, and middleware verifying protected routes.

---

## 🔐 Role Based Access Control (RBAC) Mapping

Permissions are mapped to security context scopes:

| Action Permission | ADMIN | MANAGER | USER |
| :--- | :---: | :---: | :---: |
| **users:read** | ✅ | ✅ | ✅ |
| **users:create** | ✅ | ❌ | ❌ |
| **users:edit** | ✅ | ❌ | ❌ |
| **users:delete** | ✅ | ❌ | ❌ |
| **tasks:read** | ✅ | ✅ | ✅ |
| **tasks:create** | ✅ | ✅ | ❌ |
| **tasks:edit** (any task) | ✅ | ✅ | ❌ |
| **tasks:edit** (assigned to self) | ✅ | ✅ | ✅ |
| **tasks:delete** | ✅ | ❌ | ❌ |

---

## 🚀 Getting Started & Operations

Follow the steps below to configure and execute TaskFlow CRM on your local environment.

### 1. Dependency Installation
Initialize node modules and configure local dev toolchains:
```bash
npm install
```

### 2. Launch the Authentication & Database Server
Launch the custom Node Express server which operates on port `3001`:
```bash
npm run server
```

### 3. Start the Client Development Server
Launch the Vite hot-reloading development server which maps to `http://localhost:5173`:
```bash
npm run dev
```

### 4. Run Unit Tests (Vitest)
Execute the Vitest testing suite covering authentication, user directories, Kanban boards, and permission hooks:
```bash
npx vitest run
```

### 5. Verify Build & Code Compliance
To verify type safety, lint guidelines, and asset compilation, run:
```bash
npm run build
npm run lint
npm run format:check
```

---

## 🛠️ Verification Credentials
Test authorization levels using these pre-seeded users:

| Email | Password | Role | Scope |
| :--- | :--- | :--- | :--- |
| **admin@test.com** | `admin123` | **ADMIN** | Full administrative rights (CRUD users, CRUD tasks) |
| **manager@test.com** | `manager123` | **MANAGER** | Management rights (Create tasks, Edit tasks, read users) |
| **user@test.com** | `user123` | **USER** | Standard team member rights (Edit own tasks, read board) |
