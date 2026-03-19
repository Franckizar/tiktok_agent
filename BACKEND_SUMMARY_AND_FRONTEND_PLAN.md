# Complete Code Summary & Frontend Route Plan for Bolt (Next.js)

## 📋 PART 1: BACKEND CODE SUMMARY

### 🔧 Project Overview
**Project Type**: Spring Boot REST API with JWT Authentication  
**Framework**: Spring Security 6 + JWT + Spring Data JPA  
**Database**: JPA/Hibernate (MySQL/PostgreSQL compatible)  
**Caching**: Redis (for admin profiles and pending users)  
**Email**: EmailService for password resets  

---

## 🗂️ Architecture Overview

```
src/main/java/com/example/security/
├── config/                 # Security & infrastructure config
│   ├── SecurityConfig.java
│   ├── JwtService.java
│   ├── JwtAuthenticationFilter.java
│   ├── EmailService.java
│   ├── CacheConfig.java
│   └── RateLimitInterceptor.java
├── auth/                   # Authentication module
│   ├── AuthenticationController.java
│   └── Authentication/AuthenticationService.java
├── Users/                  # User domain models
│   ├── User.java (Main entity)
│   ├── Role.java (ADMIN, ROLE_1-5, UNREG)
│   ├── UserStatus.java (PENDING, ACTIVE, SUSPENDED, DELETED)
│   ├── Admin/ (Admin profile entity)
│   └── User1/ (User1 profile entity)
├── controller/             # REST controllers
├── dto/                    # Data Transfer Objects
│   ├── request/           # Input DTOs
│   ├── response/          # Output DTOs
│   └── mapper/            # DTO Mappers
├── exception/              # Global exception handling
├── token/                  # Refresh token management
└── secure/                 # Role-based access controllers
```

---

## 👥 User Roles (Backend)

| Role | Description | Access Level |
|------|-------------|--------------|
| `ADMIN` | System Administrator | Full access |
| `SUPER_ADMIN` | First user only | Full + special privileges |
| `ROLE_1` to `ROLE_5` | Generic user types | Role-specific |
| `UNREG` | Unregistered/Pending | Limited access |

---

## 📊 User Status States

| Status | Description |
|--------|-------------|
| `PENDING` | Awaiting admin approval |
| `ACTIVE` | Fully authenticated user |
| `SUSPENDED` | Temporarily disabled |
| `DELETED` | Soft-deleted account |

---

## 🌐 API Endpoints Summary

### Authentication (Public)
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/v1/auth/register` | Register new user | [`RegisterRequest`](#registerrequest) |
| POST | `/api/v1/auth/authenticate` | Login | [`AuthenticationRequest`](#authenticationrequest) |
| POST | `/api/v1/auth/refresh` | Refresh access token | `{ "refreshToken": "..." }` |
| POST | `/api/v1/auth/logout` | Logout | Auth required |
| POST | `/api/v1/auth/forgot-password` | Initiate password reset | `?email=...` |
| POST | `/api/v1/auth/reset-password` | Complete password reset | `?token=...&newPassword=...` |

### Admin Management (ADMIN only)
| Method | Endpoint | Description | Request/Query |
|--------|----------|-------------|---------------|
| GET | `/api/v1/admin/all` | Get all admin profiles | Auth: ADMIN |
| GET | `/api/v1/admin/{id}` | Get admin by ID | Auth: ADMIN |
| PUT | `/api/v1/admin/update/{id}` | Update admin profile | [`AdminRequest`](#adminrequest) |
| POST | `/api/v1/admin/clear-cache` | Clear admin cache | Auth: ADMIN |

### Admin User Approval (ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/admin/pending-users?page=0&size=10` | Get paginated pending users |
| POST | `/api/v1/auth/admin/approve/{userId}/{role}` | Approve user with role |

### User1 Profile (ROLE_1 or ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user1/profile` | Create profile (current user) |
| GET | `/api/v1/user1/profile/{userId}` | Get user's profile |
| GET | `/api/v1/user1/profile/me` | Get own profile |
| PUT | `/api/v1/user1/profile/{userId}` | Update profile |

---

## 📦 DTO Specifications

### RegisterRequest
```typescript
interface RegisterRequest {
  firstname: string;      // Required, 2-50 chars
  lastname: string;       // Required, 2-50 chars
  email: string;          // Required, valid email
  password: string;       // Required, 6-100 chars
  role: Role;            // Required (ADMIN, ROLE_1-5, UNREG)
  
  // Optional profile fields
  profileImageUrl?: string;
  favoriteColor?: string;
  luckyNumber?: number;
  bio?: string;
  resumeUrl?: string;
  companyName?: string;
  industry?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  department?: string;
  licenseNumber?: string;
  shift?: string;
  contactNumber?: string;
  professionalEmail?: string;
  photoUrl?: string;
  officeNumber?: string;
  yearsOfExperience?: number;
  languagesSpoken?: string;
  active?: boolean;
  technicianLevel?: string;
  certifications?: string;
  displayName?: string;
}
```

### AuthenticationRequest
```typescript
interface AuthenticationRequest {
  email: string;     // Required
  password: string;  // Required
}
```

### AuthenticationResponse
```typescript
interface AuthenticationResponse {
  accessToken: string;   // JWT token (15 min expiration)
  refreshToken: string;  // JWT refresh token (7 days)
  expiresIn: number;     // Seconds until expiry
}
```

### UserResponse
```typescript
interface UserResponse {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roles: Role[];
  defaultRole: Role;
  status: UserStatus;       // PENDING, ACTIVE, SUSPENDED, DELETED
  createdAt: string;        // ISO datetime
  updatedAt: string;        // ISO datetime
  user1ProfileId?: number;
  hasUser1Profile: boolean;
  isFreeSubscribed: boolean;
  isStandardSubscribed: boolean;
  isPremiumSubscribed: boolean;
  currentPlan: string;
}
```

### PageResponse
```typescript
interface PageResponse<T> {
  content: T[];
  page: number;           // 0-indexed
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

### User1Request
```typescript
interface User1Request {
  bio?: string;
  phone?: string;
  location?: string;
}
```

### User1Response
```typescript
interface User1Response {
  id: number;
  userId: number;
  bio?: string;
  phone?: string;
  location?: string;
  active: boolean;
}
```

### AdminResponse
```typescript
interface AdminResponse {
  id: number;
  userId: number;
  favoriteColor?: string;
  luckyNumber?: number;
  isSuperAdmin: boolean;
  notes?: string;
}
```

### AdminStatsResponse
```typescript
interface AdminStatsResponse {
  totalAdmins: number;
  superAdmins: number;
  regularAdmins: number;
  superAdminPercentage: number;
}
```

---

## 🔒 Security Configuration

### Public Endpoints (No Auth Required)
- All `/api/v1/auth/**` endpoints
- `/api/test/**`
- `/api/v1/cache-test/**`
- Swagger UI: `/swagger-ui/**`, `/v3/api-docs/**`
- Actuator: `/actuator/**`
- Static uploads: `/uploads/**`

### Protected Endpoints (Auth Required)
| Path Pattern | Required Role |
|--------------|---------------|
| `/api/v1/admin/**` | ADMIN |
| `/api/v1/user/**` | USER |
| `/api/v1/editor/**` | EDITOR |
| `/api/v1/shared/**` | USER or ADMIN |

### Token Configuration
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Token Versioning**: Each logout increments token version to invalidate old tokens
- **CORS**: Enabled for all origins (no credentials)

---

## ⚠️ Issues & Recommendations

### ✅ What's Working Well:
1. JWT Authentication with refresh token rotation
2. Role-based access control (ADMIN, ROLE_1-5)
3. User registration with approval workflow
4. Admin profile management with Redis caching
5. Password reset functionality
6. User1 profile management
7. Comprehensive logging

### ⚠️ Potential Issues to Fix:
1. **CORS Configuration**: `allowCredentials(false)` with `*` origins - verify this is intentional
2. **Commented Code**: Some controllers have commented code (`Admin_User_Controller.java`)
3. **First User = Admin Logic**: Good for initial setup, but consider adding a setup flag
4. **Password Reset URL**: Hardcoded ngrok URL in [`AuthenticationService.java:360`](src/main/java/com/example/security/auth/Authentication/AuthenticationService.java:360) - should be configurable

### 🔧 Recommended Fixes:
1. Make password reset URL configurable via `application.properties`
2. Uncomment or remove unused code for cleaner codebase
3. Add input validation for password reset token expiry
4. Consider rate limiting for authentication endpoints

---

## 🚀 PART 2: FRONTEND ROUTE PLAN FOR BOLT (Next.js)

### 📁 Suggested Next.js Project Structure

```
frontend/
├── src/
│   ├── app/                    # App Router
│   │   ├── (auth)/             # Auth layout group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/        # Protected layout
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx   # Admin dashboard
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── pending/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/               # API routes (if needed)
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ForgotPasswordForm.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       ├── UserTable.tsx
│   │       └── PendingUsers.tsx
│   ├── lib/
│   │   ├── api.ts              # Axios instance with interceptors
│   │   ├── auth.ts            # Auth utilities
│   │   ├── hooks.ts           # Custom React hooks
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── store/
│       └── authStore.ts       # Zustand/Jotai store
├── public/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🎯 Complete Frontend Route Map

### 1. Public Routes (No Authentication Required)

| Route | Page Component | Description | Backend Endpoint |
|-------|---------------|-------------|------------------|
| `/` | LandingPage | Home page | - |
| `/login` | LoginPage | User login | `POST /api/v1/auth/authenticate` |
| `/register` | RegisterPage | User registration | `POST /api/v1/auth/register` |
| `/forgot-password` | ForgotPasswordPage | Request password reset | `POST /api/v1/auth/forgot-password` |
| `/reset-password?token=xxx` | ResetPasswordPage | Set new password | `POST /api/v1/auth/reset-password` |

### 2. Protected Routes (Authentication Required)

#### Dashboard Routes (All Authenticated Users)
| Route | Page Component | Description | Backend Endpoint |
|-------|---------------|-------------|------------------|
| `/dashboard` | DashboardHome | Main dashboard | - |
| `/dashboard/profile` | ProfilePage | View/edit profile | `GET /api/v1/user1/profile/me` |
| `/dashboard/settings` | SettingsPage | User settings | - |

#### Admin Routes (ADMIN Role Only)
| Route | Page Component | Description | Backend Endpoint |
|-------|---------------|-------------|------------------|
| `/dashboard/admin` | AdminDashboard | Admin overview | `GET /api/v1/admin/all` |
| `/dashboard/admin/users` | UserManagement | Manage all users | - |
| `/dashboard/admin/pending` | PendingApproval | Approve pending users | `GET /api/v1/auth/admin/pending-users` |
| `/dashboard/admin/admins` | AdminManagement | Manage admin profiles | `GET /api/v1/admin/all` |
| `/dashboard/admin/cache` | CacheManagement | Clear cache | `POST /api/v1/admin/clear-cache` |

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    POST /auth/register    ┌────────────┐  │
│  │  Register   │ ────────────────────────▶  │  Backend   │  │
│  │   Form     │                           │            │  │
│  └─────────────┘                           └─────┬──────┘  │
│       │                                           │         │
│       │ POST /auth/authenticate                    │         │
│       ▼                                           │         │
│  ┌─────────────┐                           ┌─────▼──────┐   │
│  │   Login     │ ────────────────────────▶ │ JWT Token  │   │
│  │   Form      │                           │ + Refresh  │   │
│  └─────────────┘                           └────────────┘   │
│       │                                           │         │
│       │ Store tokens (localStorage/cookies)      │         │
│       ▼                                           │         │
│  ┌─────────────────────────────────────────────┐ │         │
│  │           Protected Routes Enabled          │ │         │
│  │  /dashboard, /dashboard/admin, etc.         │ │         │
│  └─────────────────────────────────────────────┘ │         │
│       │                                           │         │
│       │ axios.interceptor adds Access Token      │         │
│       ▼                                           │         │
│  ┌─────────────┐    API Requests    ┌────────────┐ │       │
│  │ API Client  │ ──────────────────▶ │ Backend    │◀───────┘ │
│  └─────────────┘                     └────────────┘          │
│       │                                           │             │
│       │ Token expired?                            │             │
│       ▼                                           │             │
│  ┌─────────────┐    POST /auth/refresh   ┌───────▼──────┐      │
│  │ Auto Refresh│ ──────────────────────▶ │ New Tokens  │      │
│  └─────────────┘                           └─────────────┘      │
│       │                                                      │
│       │ POST /auth/logout                            ┌────────▼──┐
│       ▼ ─────────────────────────────────────────────▶│ Logged Out│
│  ┌─────────────┐                                       └──────────┘
│  │ Clear Tokens│
│  └─────────────┘
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 API Client Configuration (axios)

```typescript
// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔑 Auth Store (Zustand)

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
  status: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/api/v1/auth/authenticate', {
            email,
            password,
          });
          
          const { accessToken, refreshToken } = response.data;
          
          // Decode token or fetch user profile here
          const user = decodeToken(accessToken); // Implement this
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          await api.post('/api/v1/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },
      
      clearAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

---

## 📱 Page Components Specifications

### 1. Login Page (`/login`)
```typescript
// Form fields:
- email (email input)
- password (password input)
- remember me (checkbox)

// Actions:
- POST /api/v1/auth/authenticate
- On success: redirect to /dashboard
- On error: show error message

// Validation:
- Email: required, valid email format
- Password: required
```

### 2. Register Page (`/register`)
```typescript
// Form fields:
- firstname (text input)
- lastname (text input)
- email (email input)
- password (password input)
- confirmPassword (password input)
- role (select dropdown: ADMIN, ROLE_1, ROLE_2, ROLE_3, ROLE_4, ROLE_5)

// Additional optional fields (expandable):
- bio, phone, location, companyName, etc.

// Actions:
- POST /api/v1/auth/register
- On success: redirect to /login with message
- On error: show error message
```

### 3. Dashboard Home (`/dashboard`)
```typescript
// Components:
- Welcome message with user name
- Quick stats cards
- Recent activity
- Navigation sidebar

// User info display:
- Show user profile summary
- Show current role(s)
- Show account status (ACTIVE/PENDING)
```

### 4. Profile Page (`/dashboard/profile`)
```typescript
// GET /api/v1/user1/profile/me
// PUT /api/v1/user1/profile/{userId}

// Form fields:
- firstname (readonly)
- lastname (readonly)
- email (readonly)
- bio (textarea)
- phone (text input)
- location (text input)

// Actions:
- Fetch current profile
- Update profile data
```

### 5. Admin Dashboard (`/dashboard/admin`)
```typescript
// GET /api/v1/admin/all
// GET /api/v1/admin/{id}

// Components:
- Admin statistics cards
- Admin list table
- Actions: View, Edit, Clear Cache

// Admin stats to display:
- Total admins count
- Super admins count
- Regular admins count
```

### 6. Pending Users Page (`/dashboard/admin/pending`)
```typescript
// GET /api/v1/auth/admin/pending-users?page=0&size=10
// POST /api/v1/auth/admin/approve/{userId}/{role}

// Components:
- Paginated user table
- User details (name, email, registration date)
- Approve button (opens role selection modal)
- Reject button (optional)

// Role options for approval:
- ROLE_1, ROLE_2, ROLE_3, ROLE_4, ROLE_5
```

---

## 🎨 UI Component Library Recommendations

For a job portal application, consider using:
- **Tailwind CSS** for styling
- **Shadcn/ui** or **Radix UI** for accessible components
- **Lucide React** for icons
- **React Hook Form** + **Zod** for form validation
- **TanStack Table** for data tables (admin users)

---

## 🔧 Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

---

## 📋 Next Steps for Frontend Development

1. **Initialize Next.js project** with TypeScript and Tailwind CSS
2. **Set up authentication store** with Zustand + persistence
3. **Create API client** with axios interceptors
4. **Build auth pages**: Login, Register, Forgot Password
5. **Implement protected routes** with role-based access
6. **Create dashboard layout** with sidebar navigation
7. **Build admin panel** for user management
8. **Add profile management** features
9. **Implement error handling** and loading states
10. **Add unit tests** with Jest + React Testing Library

---

## ✅ Final Assessment

**Your backend is well-structured and production-ready** with:
- ✅ Secure JWT authentication with token rotation
- ✅ Role-based access control
- ✅ Admin user approval workflow
- ✅ Redis caching for performance
- ✅ Comprehensive logging
- ✅ Password reset functionality
- ✅ Extensible architecture (User1, User2, User3 profiles)

**Frontend recommendations**:
- Use Next.js 14+ with App Router
- Implement proper token refresh logic
- Add loading states and error boundaries
- Use TypeScript for type safety
- Follow the route plan above for seamless integration

---

*Document generated for Bolt.new AI agent to create matching Next.js frontend*
*Backend: Spring Boot | Frontend: Next.js 14+ | Auth: JWT + Refresh Tokens*
