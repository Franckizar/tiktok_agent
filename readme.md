# 🚀 PERFECT BACKEND TEMPLATE - Full Stack

A production-ready full-stack job portal application with Spring Boot backend and Next.js frontend, featuring JWT authentication, role-based access control, and modern UI components.

## 📁 Project Structure

```
Job_Portail_Spring_Final/
├── src/                          # Spring Boot Backend
│   ├── main/java/com/example/security/
│   │   ├── auth/                 # Authentication module
│   │   │   ├── AuthenticationController.java
│   │   │   └── Authentication/AuthenticationService.java
│   │   ├── config/               # Security & infrastructure
│   │   │   ├── SecurityConfig.java
│   │   │   ├── JwtService.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── EmailService.java
│   │   │   ├── RedisConfig.java
│   │   │   └── RateLimitInterceptor.java
│   │   ├── Users/               # User domain models
│   │   │   ├── User.java (Main entity)
│   │   │   ├── Role.java (ADMIN, ROLE_1-5, UNREG)
│   │   │   ├── UserStatus.java
│   │   │   ├── Admin/ (Admin profile)
│   │   │   └── User1/ (User profile)
│   │   ├── controller/          # REST controllers
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── exception/           # Global exception handling
│   │   ├── secure/              # Role-based access controllers
│   │   ├── shared/              # Shared endpoints
│   │   └── test/                # Cache testing
│   └── resources/application.properties
├── MBI_SOURCE_PROJCT/            # Next.js Frontend
│   ├── app/                      # App Router
│   │   ├── (auth)/              # Auth layout group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/         # Protected layout
│   │   │   ├── admin/
│   │   │   ├── user/
│   │   │   └── layout.tsx
│   │   ├── (marketing)/         # Public pages
│   │   │   ├── home/
│   │   │   ├── system-monitor/
│   │   │   └── test/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # Radix UI components
│   │   ├── auth/                # Auth components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── Home/                # Home page sections
│   │   └── About/               # About page components
│   ├── lib/
│   │   ├── api/                 # API client
│   │   ├── store/               # Zustand store
│   │   └── validations/         # Form validation
│   └── hooks/
├── docker-compose.yml
├── pom.xml
└── readme.md
```

---

## 🔧 Backend (Spring Boot)

### Technologies
- **Framework**: Spring Boot 3.4.4
- **Java**: 17
- **Database**: MySQL 8.0+
- **Cache**: Redis 6.0+
- **Authentication**: JWT (Access + Refresh tokens)
- **API Documentation**: OpenAPI/Swagger

### Key Dependencies
```xml
- Spring Security 6
- Spring Data JPA
- Spring Boot Starter Mail (Email)
- Redis Cache
- JWT (jjwt 0.11.5)
- Lombok
- Validation
- Actuator (Monitoring)
- Prometheus Metrics
```

### Features
✅ JWT Authentication (15 min access, 7 day refresh)  
✅ Role-based Access Control (ADMIN, ROLE_1-5, UNREG)  
✅ User Status Workflow (UNVERIFIED → PENDING → ACTIVE)  
✅ Email Verification (6-digit code)  
✅ Password Reset via Email  
✅ Redis Caching for Admin Profiles  
✅ Rate Limiting  
✅ Security Headers (HSTS, X-Frame-Options)  
✅ CORS Configuration  
✅ Global Exception Handling  

### User Roles
| Role | Description |
|------|-------------|
| `ADMIN` | Full system access |
| `SUPER_ADMIN` | First user, full + special privileges |
| `ROLE_1-5` | Generic user types |
| `UNREG` | Unregistered/Pending users |

### User Status States
| Status | Description |
|--------|-------------|
| `UNVERIFIED` | Email not verified |
| `PENDING` | Awaiting admin approval |
| `ACTIVE` | Fully authenticated |
| `SUSPENDED` | Temporarily disabled |

### API Endpoints

#### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/authenticate` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/verify-email` | Verify email |
| POST | `/api/v1/auth/resend-verification` | Resend code |
| POST | `/api/v1/auth/forgot-password` | Request reset |
| POST | `/api/v1/auth/reset-password` | Reset password |

#### Protected Endpoints
| Method | Endpoint | Role Required | Description |
|--------|----------|--------------|-------------|
| GET | `/api/v1/shared/profile/me` | Any User | Get profile |
| GET | `/api/v1/admin/all` | ADMIN | Get all admins |
| GET | `/api/v1/admin/{id}` | ADMIN | Get admin |
| PUT | `/api/v1/admin/update/{id}` | ADMIN | Update admin |
| POST | `/api/v1/admin/clear-cache` | ADMIN | Clear cache |

#### Admin User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/admin/pending-users` | Paginated pending users |
| POST | `/api/v1/auth/admin/approve/{userId}/{role}` | Approve user |

### Configuration

**Environment Variables** (`src/main/resources/application.properties`):
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Secrets (32+ characters)
jwt.access.secret=your-access-secret-key
jwt.refresh.secret=your-refresh-secret-key

# Email (Gmail)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Server
server.port=8088
```

### Running Backend

**With Docker:**
```bash
docker-compose up -d
mvn spring-boot:run
```

**Without Docker:**
```bash
# Start Redis
redis-server

# Run application
mvn spring-boot:run
```

### Monitoring
- Health Check: `http://localhost:8088/actuator/health`
- Prometheus Metrics: `http://localhost:8088/actuator/prometheus`
- Swagger UI: `http://localhost:8088/swagger-ui.html`

---

## 💻 Frontend (Next.js)

### Technologies
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **i18n**: next-i18next

### Key Dependencies
```json
- next: ^16.1.6
- react: ^19.2.4
- axios: ^1.13.4
- zustand: ^5.0.11
- zod: ^3.25.76
- @radix-ui/*: ^1.1.0+
- tailwindcss: 3.3.3
- lucide-react: ^0.446.0
- recharts: ^2.12.7
```

### Route Structure

#### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing page |
| `/login` | Login | User login |
| `/register` | Register | User registration |
| `/forgot-password` | ForgotPassword | Request password reset |
| `/reset-password` | ResetPassword | Reset password page |
| `/verify-email` | VerifyEmail | Email verification |

#### Protected Routes (Authenticated)
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | DashboardHome | Main dashboard |
| `/dashboard/user` | UserDashboard | User dashboard |
| `/dashboard/admin` | AdminDashboard | Admin overview |
| `/dashboard/admin/users` | UserManagement | Manage users |
| `/dashboard/admin/pending` | PendingApproval | Approve pending users |

### State Management (Zustand)

```typescript
// Auth Store
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
```

### API Client Configuration

```typescript
// lib/api/index.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - adds auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return api(error.config);
      } catch (e) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Register ──► Verify Email ──► Login ──► Dashboard          │
│       │                              │                       │
│       │                              ▼                       │
│       │                      ┌─────────────┐                │
│       │                      │ Protected   │                │
│       │                      │ Routes      │                │
│       │                      └─────────────┘                │
│       │                              │                       │
│       │                      Token Refresh (if expired)     │
│       │                              │                       │
│       ▼                              ▼                       │
│  Login ────────────────────────────────► Logout             │
│       │                                                      │
│       ▼                                                      │
│  Forgot Password ──► Reset Password                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Running Frontend

```bash
cd MBI_SOURCE_PROJCT

# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Start production
npm start

# Type checking
npm run typecheck
```

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8088
```

---

## 🐳 Docker Deployment

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8088:8088"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: job_portal
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  frontend:
    build: ./MBI_SOURCE_PROJCT
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

---

## 📊 Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │   State (Zustand)  │  │
│  │  /app/      │  │  /components│  │   /lib/store/      │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │  API Client │                          │
│                    │  (axios)    │                          │
│                    └──────┬──────┘                          │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Security Filter Chain                    │   │
│  │         (JWT Authentication + Rate Limiting)          │   │
│  └───────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│         ┌────────────────┼────────────────┐                  │
│         ▼                ▼                ▼                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  Auth       │ │  Admin      │ │  Shared Controllers │   │
│  │  Controller │ │  Controller │ │  (Profile, etc.)   │   │
│  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘   │
│         │                │                   │              │
│         └────────────────┼───────────────────┘              │
│                          │                                  │
│                    ┌──────▼──────┐                          │
│              ┌─────│  Services  │─────┐                    │
│              │     └──────┬──────┘     │                    │
│              │            │            │                    │
│     ┌────────▼────────┐   │   ┌───────▼────────┐            │
│     │  MySQL Database │   │   │ Redis Cache    │            │
│     │   (JPA/Hibernate)│   │   │ (Admin Profile)│            │
│     └─────────────────┘   │   └────────────────┘            │
│                           │                                 │
│              ┌────────────┴────────────┐                    │
│              ▼                         ▼                     │
│     ┌─────────────────┐       ┌─────────────────┐           │
│     │  Email Service  │       │  JWT Service     │           │
│     │  (SMTP/Gmail)   │       │  (Token mgmt)   │           │
│     └─────────────────┘       └─────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Features

### Backend
- BCrypt Password Hashing
- JWT Token Authentication (Access + Refresh)
- Role-based Access Control
- Rate Limiting
- Security Headers (HSTS, X-Frame-Options)
- CORS Configuration
- Input Validation
- Account Status Management

### Frontend
- Protected Routes
- Token Refresh Logic
- Auth State Management
- Form Validation (Zod)
- Secure Cookie Storage

---

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Job_Portail_Spring_Final
```

### 2. Backend Setup
```bash
# Configure database and Redis in application.properties
# Configure JWT secrets
# Configure email credentials

# Run with Maven
mvn spring-boot:run

# Or with Docker
docker-compose up -d
```

### 3. Frontend Setup
```bash
cd MBI_SOURCE_PROJCT
npm install
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8088
- Swagger UI: http://localhost:8088/swagger-ui.html

---

## 📝 Testing Examples

### Authentication Test (cURL)
```bash
# Register
curl -X POST http://localhost:8088/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "ROLE_1"
  }'

# Login
curl -X POST http://localhost:8088/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Profile (with token)
curl -X GET http://localhost:8088/api/v1/shared/profile/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🧪 Development

### Backend Commands
```bash
# Run tests
mvn test

# Build JAR
mvn clean package -DskipTests

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### Frontend Commands
```bash
# Lint
npm run lint

# Type check
npm run typecheck
```

---

## 📦 Production Deployment

### Backend (JAR)
```bash
# Build
mvn clean package -DskipTests

# Run
java -jar target/security-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Frontend (Next.js)
```bash
# Build
npm run build

# Start production server
npm start
```

### Docker Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Check API documentation at `/swagger-ui.html`
- Review backend logs at `logs/backend.log`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Spring Boot + Next.js**
