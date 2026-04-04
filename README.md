# Zorvyn Finance Backend

A secure, role-based finance data processing backend for Zorvyn — a fintech company building intelligent financial systems for startups and SMEs.

## Requirements

Before you begin, ensure you have:
- **Node.js** >= 18 (check: `node --version`)
- **npm** >= 9 (check: `npm --version`)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file (configure if needed)
cp .env.example .env

# 3. Generate Prisma client
npm run db:generate

# 4. Run migrations
npm run db:migrate

# 5. Seed test data
npm run db:seed

# 6. Start development server
npm run dev
```

Server will run on `http://localhost:3000`

This backend is structured for a **finance dashboard** where different stakeholders (admins, analysts, viewers) interact with financial data at different permission levels. The architecture prioritizes:

- **Security**: JWT auth, RBAC middleware, input validation, rate limiting
- **Data integrity**: Amounts stored as integers (cents) to avoid floating-point errors
- **Auditability**: Soft deletes and audit logging for financial compliance
- **Maintainability**: Modular structure with clean separation of concerns

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| ORM | Prisma |
| Database | SQLite |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Testing | Vitest + Supertest |

## Project Structure

```
src/
├── app.ts                    # Express app setup
├── server.ts                 # Server entry point
├── config/                   # Environment configuration
├── common/
│   ├── middleware/            # Auth, RBAC, validation, error handling, logging
│   ├── utils/                # Response helpers, Prisma client
│   ├── errors/               # Custom error classes
│   └── types/                # Shared TypeScript types and enums
└── modules/
    ├── auth/                 # Login endpoint
    ├── users/                # User CRUD (admin only)
    ├── records/              # Financial records CRUD
    └── dashboard/            # Analytics and summary APIs
prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Seed data
tests/
└── api.test.ts               # Integration tests
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file (configure if needed)
cp .env.example .env

# 3. Generate Prisma client
npm run db:generate

# 4. Run migrations
npm run db:migrate

# 5. Seed test data
npm run db:seed

# 6. Start development server
npm run dev
```

Server will run on `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | SQLite file path | `file:./dev.db` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | Token expiry | `24h` |

## Seeded Users

| Email | Password | Role |
|-------|----------|------|
| admin@zorvyn.dev | Admin@123 | ADMIN |
| analyst@zorvyn.dev | Analyst@123 | ANALYST |
| viewer@zorvyn.dev | Viewer@123 | VIEWER |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login, returns JWT |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users` | Create user |
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/users/:id` | Get user by ID |
| PATCH | `/api/v1/users/:id` | Update user |
| PATCH | `/api/v1/users/:id/status` | Activate/deactivate user |

### Financial Records
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/records` | All roles | List records (paginated, filterable) |
| GET | `/api/v1/records/:id` | All roles | Get single record |
| POST | `/api/v1/records` | Admin | Create record |
| PATCH | `/api/v1/records/:id` | Admin | Update record |
| DELETE | `/api/v1/records/:id` | Admin | Soft delete record |

**Query params for listing**: `page`, `limit`, `type`, `category`, `createdBy`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/summary` | Total income, expenses, net balance |
| GET | `/api/v1/dashboard/category-breakdown` | Category-wise totals |
| GET | `/api/v1/dashboard/recent-activity` | Latest records |
| GET | `/api/v1/dashboard/trends?groupBy=month` | Monthly/weekly trends |

## Role Permission Matrix

| Action | VIEWER | ANALYST | ADMIN |
|--------|--------|---------|-------|
| View records | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

## Response Format

```json
// Success
{
  "success": true,
  "message": "Record created successfully",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "amount", "message": "Amount must be positive" }]
}

// Paginated
{
  "success": true,
  "message": "Records retrieved",
  "data": [...],
  "meta": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Amounts in cents (integers)** | Avoids floating-point precision issues for financial data |
| **Soft deletes** | Financial records should never be permanently lost; audit trail |
| **Audit log table** | Tracks create/update/delete for compliance |
| **SQLite** | Zero-config local setup; easily swappable to PostgreSQL |
| **Centralized RBAC middleware** | Permissions enforced at route level, not scattered in controllers |
| **Zod validation** | Type-safe validation with clear error messages |
| **Thin controllers** | Business logic lives in services for testability |

## Running Tests

```bash
npm test
```

Tests cover: auth login/failure, RBAC enforcement, record CRUD authorization, dashboard correctness, validation.

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `npm run dev` | Start dev server with hot reload (port 3000) |
| **Build** | `npm run build` | Compile TypeScript to JavaScript |
| **Start** | `npm start` | Run compiled output (production) |
| **Database** | `npm run db:generate` | Generate Prisma client |
| | `npm run db:migrate` | Run pending migrations |
| | `npm run db:seed` | Seed database with test data |
| | `npm run db:reset` | Reset database (⚠️ deletes all data) |
| | `npm run db:studio` | Open Prisma Studio dashboard (port 5555) |
| **Testing** | `npm test` | Run full test suite once |
| | `npm run test:watch` | Watch mode - re-run on file changes |

---

## Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

Output:
```
🚀 Zorvyn Finance Backend running on port 3000
📍 Environment: development
🔗 http://localhost:3000/health
```

Visit `http://localhost:3000/health` - you should see:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Production Mode
```bash
npm run build
npm start
```

---

## Database Management

### View Database Visually (Prisma Studio)
```bash
npm run db:studio
```
Opens interactive UI at `http://localhost:5555` - browse tables, edit records

### Reset Database (Wipes all data)
```bash
npm run db:reset
```
This will:
1. Drop all tables
2. Apply migrations again
3. Re-seed test data

### Run Migrations
```bash
npm run db:migrate
```
Creates a new migration based on schema changes

---

## Testing

### Run All Tests Once
```bash
npm test
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Test Coverage
- ✅ Authentication (login, invalid credentials, missing fields)
- ✅ RBAC (role-based access control for all endpoints)
- ✅ Financial Records CRUD (with auth checks)
- ✅ Dashboard analytics
- ✅ Input validation

**Expected Output**: 16 tests passing in ~9 seconds

---

## Testing API Endpoints

### Option 1: Using curl
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zorvyn.dev","password":"Admin@123"}'
```

### Option 2: Using VS Code REST Client Extension
Create `requests.http` in project root:

```http
### Health Check
GET http://localhost:3000/health

### Login (Save JWT token for other requests)
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@zorvyn.dev",
  "password": "Admin@123"
}

### Get Dashboard Summary (Replace TOKEN with JWT from login)
GET http://localhost:3000/api/v1/dashboard/summary
Authorization: Bearer TOKEN

### List Records
GET http://localhost:3000/api/v1/records
Authorization: Bearer TOKEN

### Create Record (Admin only)
POST http://localhost:3000/api/v1/records
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "amount": 150000,
  "type": "INCOME",
  "category": "Consulting",
  "date": "2026-04-05",
  "description": "Client project payment"
}

### Get Category Breakdown
GET http://localhost:3000/api/v1/dashboard/category-breakdown
Authorization: Bearer TOKEN

### Get Trends (Monthly)
GET http://localhost:3000/api/v1/dashboard/trends?groupBy=month
Authorization: Bearer TOKEN
```

**To use**: Click "Send Request" above each request

### Option 3: Postman / Insomnia
1. Create a new collection
2. Add requests (see REST Client examples above)
3. Set `Authorization` header to `Bearer {token}` for authenticated endpoints

---

## Known Issues & Troubleshooting

### Issue: `unknown or unexpected option: --skip-seed`
**Fixed** ✅ - Updated `tests/setup.ts` to use correct Prisma 7 syntax

### Issue: `PrismaClientInitializationError: Must provide adapter or accelerateUrl`
**Fixed** ✅ - Updated to use `@prisma/adapter-better-sqlite3` for local SQLite

### Issue: Port 3000 already in use
```bash
# Change port in .env
PORT=3001
npm run dev
```

### Issue: Database locked
```bash
# Close other connections and try again
npm run db:reset
```

---

## Future Enhancements

- 📧 Email notifications for large transactions
- ⏱️ Rate limiting per user/role
- 📚 OpenAPI/Swagger documentation
- 🔄 CI/CD pipeline with automated testing
- 🗄️ PostgreSQL for production deployment
- ⚡ Redis caching for dashboard aggregations

---

## Support & Contributing

For issues or contributions, please refer to the project repository.
