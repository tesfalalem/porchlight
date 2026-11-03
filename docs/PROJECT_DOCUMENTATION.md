# Porchlight Apartment — Comprehensive Technical & System Documentation

**Porchlight Apartment** is a full-stack web platform and property management system designed specifically for a boutique furnished residential building in **Bole, Addis Ababa, Ethiopia**.

The project comprises two main experiences:
1. **Public Guest Portal:** A customer-facing digital showroom presenting available suites, virtual video tours, building amenities, location information, and an inquiry/booking intake workflow.
2. **Admin Operations Suite (`/admin`):** A JWT-protected property management dashboard and CRM enabling property managers to monitor occupancy rates, manage apartment listings & media, track tenant lifecycles, and triage prospective inquiries.

---

## 1. System Architecture & Monorepo Layout

The repository is organized as an **npm workspaces monorepo**, ensuring unified dependency management, type sharing, and synchronized build steps across client and server packages.

```
porchlight/
├── apps/
│   ├── api/                   # Express REST API + Prisma ORM + PostgreSQL
│   │   ├── prisma/            # Schema definition, migrations, and database seed
│   │   ├── src/
│   │   │   ├── config/        # Environment variables and Prisma client singleton
│   │   │   ├── controllers/   # Request/response handlers
│   │   │   ├── middleware/    # Auth verification, error handling, validator runner
│   │   │   ├── routes/        # Express route definitions
│   │   │   ├── services/      # Core business logic and database queries
│   │   │   ├── utils/         # Data transfer mappers and error definitions
│   │   │   └── validators/    # express-validator route schemas
│   │   └── server.ts          # Server entry point (starts on port 4000)
│   │
│   └── web/                   # Single Page Application (React 19 + Vite)
│       ├── public/            # Static assets, hero imagery, tour videos
│       ├── src/
│       │   ├── components/    # Reusable UI components (admin, apartments, forms, layout)
│       │   ├── hooks/         # Custom React hooks (useAuth, useDocumentTitle, usePageMeta)
│       │   ├── lib/           # Axios API client configured with auth interceptors
│       │   ├── pages/         # Public pages and Admin dashboard pages
│       │   ├── services/      # Axios-based service modules calling API endpoints
│       │   └── utils/         # Formatting helpers (currencies, dates)
│       └── tailwind.config.js # Custom design tokens (Navy, Sapphire, Slate)
│
├── packages/
│   └── shared/                # Shared TypeScript contracts & domain constants
│       └── src/
│           ├── constants.ts   # Company metadata, statuses, editorial copy
│           ├── index.ts       # Barrel export
│           └── types.ts       # Shared TypeScript interfaces and DTOs
│
├── docker-compose.yml         # Containerized PostgreSQL 16 service
└── package.json               # Root monorepo workspace configuration
```

### Technology Matrix

| Layer | Technology | Key Libraries / Role |
| :--- | :--- | :--- |
| **Monorepo** | npm Workspaces | Concurrently, cross-package linking |
| **Frontend Framework** | React 19 + TypeScript | Single Page Application bundled with Vite 6 |
| **Client Routing** | React Router v7 | Nested public layouts & authenticated admin routes |
| **Data Fetching** | TanStack React Query v5 | Server state caching, optimistic updates, query invalidation |
| **Styling & Design** | Tailwind CSS v3 | Custom HSL/RGB design system (Midnight Navy & Sapphire) |
| **Forms & Validation** | React Hook Form + Zod | Strict schema validation with `@hookform/resolvers/zod` |
| **Charts & Analytics** | Recharts v2 | Responsive SVG charts (Pie & Bar charts) |
| **Icons** | Lucide React | Modern feather-inspired SVG icon system |
| **Backend Runtime** | Node.js (>=20) + Express 4 | RESTful API with ES Modules and `tsx` execution |
| **Database & ORM** | PostgreSQL 16 + Prisma v6 | Type-safe queries, relational migrations, schema management |
| **Auth & Security** | JWT (`jsonwebtoken`) + bcryptjs | Bearer token authentication with password hashing (12 rounds) |
| **API Validation** | `express-validator` | Declarative request payload and URL parameter validation |

---

## 2. Database Schema & Relational Design

The system database is managed through **Prisma ORM** connecting to **PostgreSQL**. The schema captures apartment inventory, high-resolution imagery, amenities, customers (leads/tenants), and customer inquiries.

### Entity Relationship Diagram

```mermaid
erDiagram
    AdminUser {
        String id PK
        String email UK
        String passwordHash
        String name
        DateTime createdAt
        DateTime updatedAt
    }

    Apartment {
        String id PK
        String name
        String number UK
        String description
        String type
        String location
        Int floor
        Int bedrooms
        Int bathrooms
        Float size
        Decimal price
        String availabilityStatus
        DateTime availableFrom
        Boolean isArchived
        DateTime createdAt
        DateTime updatedAt
    }

    ApartmentImage {
        String id PK
        String url
        String alt
        Int sortOrder
        Boolean isPrimary
        String apartmentId FK
        DateTime createdAt
    }

    Amenity {
        String id PK
        String name UK
        String slug UK
        String icon
        String description
        DateTime createdAt
        DateTime updatedAt
    }

    ApartmentAmenity {
        String apartmentId PK, FK
        String amenityId PK, FK
    }

    Customer {
        String id PK
        String name
        String email
        String phone
        String notes
        DateTime createdAt
        DateTime updatedAt
    }

    Inquiry {
        String id PK
        String subject
        String message
        String status
        String internalNotes
        String apartmentId FK
        String customerId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Apartment ||--o{ ApartmentImage : "has many"
    Apartment ||--o{ ApartmentAmenity : "has many"
    Amenity ||--o{ ApartmentAmenity : "belongs to"
    Apartment ||--o{ Inquiry : "referenced by"
    Customer ||--o{ Inquiry : "submits"
```

### Table Breakdown & Constraints

1. **`AdminUser`**:
   - Stores administrative credentials for `/admin` authentication.
   - Enforces unique email constraints.
   - Passwords stored as bcrypt hashes.

2. **`Apartment`**:
   - Represents physical furnished rental units.
   - Unique constraint on unit `number` (e.g., `A-101`, `B-204`).
   - Supports numeric attributes (`floor`, `bedrooms`, `bathrooms`, `size` in sqm, `price` with `Decimal(12,2)` precision).
   - Soft-delete flag: `isArchived` (boolean). Default is `false`. Soft-archived units do not appear on public listing pages or active admin lists unless explicitly queried.

3. **`ApartmentImage`**:
   - Stores image URLs (CDN/Unsplash/Cloud storage links) with `sortOrder` for display sequence.
   - `isPrimary` identifies thumbnail cards on listing grids.
   - Foreign key cascade: Deleting an apartment permanently cascades to its images.

4. **`Amenity` & `ApartmentAmenity`**:
   - Many-to-many relationship connecting apartments with features (e.g., *24/7 Security*, *Backup Generator*, *High-speed WiFi*, *In-unit Laundry*).
   - Identifiers include human-readable `name` and slugified `slug` (e.g. `washer-dryer`).

5. **`Customer`**:
   - Central contact repository for prospective leads, active tenants, and past residents.
   - Indexed on `email` for quick lookup during inquiry submissions.
   - Flexible `notes` text field that encodes tenant lifecycle status (e.g., `[Status: Active Tenant]`).

6. **`Inquiry`**:
   - Intake records generated from public contact forms, apartment booking requests, or direct staff entry.
   - Status transitions: `New` &rarr; `Contacted` &rarr; `In Progress` &rarr; `Resolved` &rarr; `Closed`.
   - Indexed on `status` and `createdAt` for fast operational filtering and dashboard metrics.

---

## 3. Backend Architecture (`apps/api`)

The backend follows a clean, layered Express architecture separating HTTP transport from business logic.

```
Request  ──>  Routes  ──>  Validators  ──>  Middleware (Auth)  ──>  Controllers  ──>  Services  ──>  Prisma / DB
                                                                                          │
                                                                                          ▼
Response <──  Error Middleware  <──  AppError  <──────────────────────────────────────────┘
```

### Key Modules

- **`src/config/env.ts`**: Centralized, fail-fast environment parsing. Validates required variables like `DATABASE_URL` and `JWT_SECRET` upon startup.
- **`src/middleware/auth.ts`**: Verifies JWT Bearer tokens in incoming `Authorization` headers. Attaches decoded token payload `{ id, email }` to `req.user`.
- **`src/middleware/validate.ts`**: Integrates with `express-validator` to capture validation failures and emit formatted 400 JSON payloads.
- **`src/middleware/errorHandler.ts`**: Catches unhandled errors and custom `AppError` exceptions, formatting responses with proper HTTP status codes.
- **`src/utils/mappers.ts`**: Translates raw Prisma models and Decimal objects into strongly-typed DTOs defined in `@porchlight/shared`.

### Complete REST API Reference

#### Authentication
- `POST /api/auth/login`
  - **Access:** Public
  - **Body:** `{ "email": "admin@porchlight.com", "password": "ChangeMe123!" }`
  - **Response:** `{ "token": "<jwt>", "admin": { "id": "...", "email": "...", "name": "..." } }`

#### Apartments
- `GET /api/apartments`
  - **Access:** Public
  - **Query Parameters:**
    - `search`: Case-insensitive search on unit name, number, or location
    - `type`: Unit type filter (e.g., `2 Bedroom`, `3 Bedroom`)
    - `bedrooms`: Number of bedrooms
    - `bathrooms`: Number of bathrooms
    - `minPrice` / `maxPrice`: Price range boundaries
    - `availabilityStatus`: `Available` | `Occupied` | `Upcoming`
    - `amenityIds`: Comma-separated amenity IDs
    - `sort`: `price_asc` | `price_desc` | `name_asc` | `availability`
  - **Response:** `ApartmentListItemDto[]`
- `GET /api/apartments/:id`
  - **Access:** Public
  - **Response:** `ApartmentDetailDto`
- `POST /api/apartments`
  - **Access:** Admin (Bearer JWT required)
  - **Body:** `ApartmentInput`
- `PUT /api/apartments/:id`
  - **Access:** Admin (Bearer JWT required)
  - **Body:** `ApartmentInput`
- `DELETE /api/apartments/:id`
  - **Access:** Admin (Bearer JWT required)
  - **Behavior:** Soft-archives the apartment (`isArchived: true`).
- `DELETE /api/apartments/:id/permanent`
  - **Access:** Admin (Bearer JWT required)
  - **Behavior:** Permanently deletes the apartment record from the database.

#### Amenities
- `GET /api/amenities`
  - **Access:** Public
  - **Response:** `AmenityDto[]`
- `POST /api/amenities`
  - **Access:** Admin
  - **Body:** `{ "name": "Gym", "slug": "gym", "icon": "dumbbell", "description": "..." }`
- `PUT /api/amenities/:id`
  - **Access:** Admin

#### Customers (CRM)
- `GET /api/customers`
  - **Access:** Admin
  - **Query Parameters:** `search` (name, email, phone)
  - **Response:** `CustomerDto[]`
- `GET /api/customers/:id`
  - **Access:** Admin
  - **Response:** Customer details including nested historical inquiries and unit links
- `POST /api/customers`
  - **Access:** Admin
  - **Body:** `{ "name": "...", "email": "...", "phone": "...", "notes": "..." }`
- `PUT /api/customers/:id`
  - **Access:** Admin
- `DELETE /api/customers/:id`
  - **Access:** Admin

#### Inquiries
- `POST /api/inquiries`
  - **Access:** Public
  - **Body:**
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+251911223344",
      "subject": "Inquiry regarding Unit B-204",
      "message": "I would like to schedule a viewing next Tuesday.",
      "apartmentId": "apt_cuid_123"
    }
    ```
  - **Behavior:** Upserts a `Customer` record based on email, then creates the `Inquiry` in `New` status.
- `GET /api/inquiries`
  - **Access:** Admin
  - **Query Parameters:** `status`, `search`
- `GET /api/inquiries/:id`
  - **Access:** Admin
- `PUT /api/inquiries/:id`
  - **Access:** Admin
  - **Body:** `{ "status": "In Progress", "internalNotes": "Followed up via phone on 27/10." }`
- `DELETE /api/inquiries/:id`
  - **Access:** Admin

#### Dashboard & Analytics
- `GET /api/dashboard/stats`
  - **Access:** Admin
  - **Response:** `DashboardStatsDto` containing total units, occupancy distribution, customer counts categorized by stage (Active, In-Process, Past), unhandled inquiries, and latest activity logs.

---

## 4. Frontend Architecture (`apps/web`)

The frontend is built with React 19 and Vite, styled using a tailored corporate design system, and structured for optimal usability.

### Route Map

```
/                                  ── HomePage (Editorial Hero, Quick Features, Map)
/about                             ── AboutPage (Brand Philosophy & Building Narrative)
/apartments                        ── ApartmentsPage (Full catalog with live filter drawer)
/apartments/2-bedroom              ── BedroomListingPage (Filtered 2-bed gallery + calendar selector)
/apartments/3-bedroom              ── BedroomListingPage (Filtered 3-bed gallery + calendar selector)
/apartments/:id                    ── ApartmentDetailPage (Gallery, specs, amenity list, inquiry modal)
/tour                              ── TourPage (Virtual video walk-throughs in 9:16 portrait)
/contact                           ── ContactPage (Interactive contact form, phone, WhatsApp links)
/privacy                           ── PrivacyPage (Legal privacy disclosures)
/terms                             ── TermsPage (Terms of stay & lease guidelines)

/admin/login                       ── AdminLoginPage (Admin credentials auth)
/admin/dashboard                   ── DashboardPage (Operational charts & status metrics)
/admin/apartments                  ── AdminApartmentsPage (Inventory data table)
/admin/apartments/new              ── AddApartmentPage (Multi-attribute creation wizard)
/admin/apartments/:id              ── AdminApartmentDetailPage (Editor, image manager, status toggle)
/admin/customers                   ── AdminCustomersPage (CRM tenant index)
/admin/customers/new               ── AddCustomerPage (Tenant/Lead manual creation)
/admin/customers/:id               ── CustomerDetailPage (Lifecycle timeline, communication history)
/admin/inquiries                   ── AdminInquiriesPage (Triaged customer requests)
/admin/inquiries/:id               ── InquiryDetailPage (Status progression & correspondence notes)
```

### Authentication Lifecycle (`useAuth`)

```mermaid
sequenceDiagram
    participant User
    participant AdminLoginPage
    participant useAuth
    participant apiClient
    participant ExpressAPI

    User->>AdminLoginPage: Enters email and password
    AdminLoginPage->>useAuth: login(email, password)
    useAuth->>ExpressAPI: POST /api/auth/login
    ExpressAPI-->>useAuth: { token: "<jwt>", admin: { ... } }
    useAuth->>useAuth: Persist token to localStorage (porchlight_admin_token)
    useAuth->>useAuth: Update isAuthenticated = true
    useAuth-->>AdminLoginPage: Redirect to /admin/dashboard
    
    Note over apiClient,ExpressAPI: Subsequent requests inject Authorization: Bearer <token>
    
    ExpressAPI-->>apiClient: 401 Unauthorized (e.g. token expired)
    apiClient->>useAuth: Interceptor detects 401
    useAuth->>useAuth: Clear localStorage
    apiClient-->>User: Automatic redirect to /admin/login
```

### Visual Identity & Design System

The application styling is declared in `apps/web/src/index.css` and extended in `tailwind.config.js`:
- **Deep Midnight Sapphire (`--color-navy-950: 11 19 43`)**: Anchor background for high-contrast elements, footers, and modal headers.
- **Electric Sapphire (`--color-accent: 37 99 235`)**: Primary brand action color used for primary CTA buttons, active state indicators, and focus outlines.
- **Ice Canvas (`--color-slate-50: 248 250 252`)**: Light background for modern editorial layout.
- **Typography**: 
  - *Display / Headings:* `"Cormorant Garamond"`, Georgia, serif — provides an upscale, residential luxury aesthetic.
  - *Body / Interface:* `"Source Sans 3"`, system-ui, sans-serif — ensures crisp readability for administrative tables, data values, and long-form descriptions.

---

## 5. Shared Package (`packages/shared`)

The shared package maintains single sources of truth across the monorepo:

- **`types.ts`**: TypeScript definitions for `ApartmentListItemDto`, `ApartmentDetailDto`, `AmenityDto`, `CustomerDto`, `InquiryDto`, `DashboardStatsDto`, and `AuthLoginResponse`.
- **`constants.ts`**:
  - `AVAILABILITY_STATUSES`: `['Available', 'Upcoming', 'Occupied']`
  - `INQUIRY_STATUSES`: `['New', 'Contacted', 'In Progress', 'Resolved', 'Closed']`
  - `COMPANY`: Contact data including phone numbers (`+251 911 000 000`), address (`Bole, Addis Ababa, Ethiopia`), official email, social channels (Instagram, Facebook, LinkedIn), and working hours.
  - `ABOUT_COPY`: Standardized brand narrative used across public views.

---

## 6. Local Development & Operational Runbook

### Prerequisites
- **Node.js**: Version 20.x or higher
- **Docker Desktop**: For running the PostgreSQL database container

### Setup Instructions

1. **Clone & Install Dependencies:**
   ```bash
   git clone <repo-url> porchlight
   cd porchlight
   npm install
   ```

2. **Start the Database Service:**
   ```bash
   npm run db:up
   ```
   *Spins up a PostgreSQL 16 container mapping external port `5433` to container port `5432`.*

3. **Configure Environment Variables:**
   ```bash
   # Copy API environment
   copy apps\api\.env.example apps\api\.env
   
   # Copy Web environment (optional - defaults to proxying /api to port 4000)
   copy apps\web\.env.example apps\web\.env
   ```

   *Default `.env` settings for `apps/api/.env`:*
   ```ini
   DATABASE_URL="postgresql://porchlight:porchlight_dev@localhost:5433/porchlight?schema=public"
   JWT_SECRET="development-jwt-secret-replace-in-production"
   API_PORT=4000
   CORS_ORIGIN="http://localhost:5173,http://127.0.0.1:5173"
   ADMIN_EMAIL="admin@porchlight.com"
   ADMIN_PASSWORD="ChangeMe123!"
   ADMIN_NAME="Porchlight Admin"
   ```

4. **Initialize Database Schema & Sample Data:**
   ```bash
   # Run Prisma migrations
   npm run db:migrate
   
   # Seed default amenities, demo apartments, and the default admin account
   npm run db:seed
   ```

5. **Start Development Servers:**
   ```bash
   # Run both API and Web concurrently
   npm run dev
   ```
   - **Frontend App:** [http://localhost:5173](http://localhost:5173)
   - **API Health Check:** [http://localhost:4000/api/health](http://localhost:4000/api/health)
   - **Admin Portal:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
     - *Default Credentials:* `admin@porchlight.com` / `ChangeMe123!`

---

## 7. Operational Scripts Reference

All primary tasks can be executed from the root workspace:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both Express backend and Vite frontend concurrently |
| `npm run dev:api` | Compiles `@porchlight/shared` and starts the API via `tsx watch` |
| `npm run dev:web` | Starts the Vite development server with HMR |
| `npm run build` | Compiles `@porchlight/shared`, builds `apps/api` (tsc), and bundles `apps/web` (Vite) |
| `npm run lint` | Runs ESLint verification across all packages |
| `npm run db:up` | Runs `docker compose up -d postgres` |
| `npm run db:migrate` | Runs `prisma migrate dev` inside `apps/api` |
| `npm run db:seed` | Executes `prisma/seed.ts` to populate initial datasets |
| `npm run db:studio` | Opens Prisma Studio GUI at `http://localhost:5555` to browse records |

---

## 8. Production Deployment Guidelines

1. **Security Hardening:**
   - Change `JWT_SECRET` in `apps/api/.env` to a cryptographically secure 64-character random string.
   - Update default admin email and strong password before seeding or running in production.
   - Configure `CORS_ORIGIN` to match your production domain.
2. **Database Migrations in CI/CD:**
   - Execute `npm run db:deploy --workspace=apps/api` instead of `db:migrate` (runs migrations without prompting).
3. **Frontend Build & Serving:**
   - Run `npm run build --workspace=apps/web`.
   - Host the generated `apps/web/dist` on a static CDN or Nginx reverse proxy.
   - Point `/api` reverse-proxy traffic to the Node.js Express process (e.g., managed via PM2 or Docker).
