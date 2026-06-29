# FARM Stack — User & Student Management System

A full-stack web application built on the **FARM** stack (**F**astAPI · **R**eact · **M**ongoDB) that provides student record management alongside a complete user management system with role-based access control, admin groups, services, and permissions.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Frontend](#frontend)
- [Database Layout](#database-layout)
- [Design Decisions](#design-decisions)

---

## Overview

The application exposes a RESTful API backed by MongoDB and serves a React single-page dashboard. It is split into two logical domains:

| Domain | Purpose |
|--------|---------|
| **Students** | Original CRUD for academic student records (GPA, CGPA, level, etc.) |
| **Users + Admin** | Full user-profile system (27 fields) with role assignment, admin-group membership, service allocation, permission management, and admin-only operations |

The frontend is a three-view dashboard (Dashboard · Students · API Endpoints) built with React 19 and plain CSS — no UI-framework dependency at runtime.

---

## Tech Stack

### Backend

| Package | Version | Role |
|---------|---------|------|
| Python | ≥ 3.10 | Runtime |
| FastAPI | 0.104.1 | Web framework + OpenAPI docs |
| Uvicorn | 0.24.0 | ASGI server |
| PyMongo | 4.6.1 | MongoDB driver |
| Pydantic | (bundled with FastAPI) | Request validation and serialisation |
| python-dotenv | 1.0.0 | `.env` loading |

### Frontend

| Package | Version | Role |
|---------|---------|------|
| React | 19.2.6 | UI library |
| React DOM | 19.2.6 | DOM rendering |
| Axios | 1.16.1 | HTTP client |
| Bootstrap | 5.3.8 | Utility CSS (form controls only) |

### Database

| System | Usage |
|--------|-------|
| MongoDB | Primary store — two logical databases, six collections |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Browser (React SPA)                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │Dashboard │  │Students  │  │  API Endpoints view  │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       └─────────────┴──────────────┬─────┘              │
│                            Axios (HTTP)                  │
└────────────────────────────────────┼─────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  FastAPI (Uvicorn ASGI)          │
                    │                                  │
                    │  /students/*   student_router    │
                    │  /users/*      user_router       │
                    │  /roles/*      role_router       │
                    │  /admin-groups/* group_router    │
                    │  /services/*   service_router    │
                    │  /permissions/* perm_router      │
                    │  /admin/*      admin_router      │
                    └────────────────┬────────────────┘
                                     │  PyMongo
                    ┌────────────────▼────────────────┐
                    │  MongoDB                         │
                    │  StudentDB.students              │
                    │  UserDB.users                    │
                    │  UserDB.roles                    │
                    │  UserDB.admin_groups             │
                    │  UserDB.services                 │
                    │  UserDB.permissions              │
                    └──────────────────────────────────┘
```

CORS is configured to allow `http://localhost:3000` and `http://127.0.0.1:3000` so the React dev server can reach the API during development without a proxy.

---

## Project Structure

```
FARM-stack-project/
│
├── main.py                  # FastAPI app entry point; registers all routers
├── config.py                # MongoDB client (reads MONGODB_API_URL from env)
├── requirements.txt         # Python dependencies
│
├── models/                  # Pydantic request/body models
│   ├── student.py           # Student (fname, lname, gpa, cgpa, level …)
│   ├── user.py              # User (27 fields, VerificationStatus enum)
│   ├── role.py              # Role
│   ├── admin_group.py       # AdminGroup + permission_ids list
│   ├── service.py           # Service
│   └── permission.py        # Permission (name, resource, action)
│
├── schemas/                 # Document → dict serialisers (ObjectId to str)
│   ├── student.py
│   ├── user.py
│   ├── role.py
│   ├── admin_group.py
│   ├── service.py
│   └── permission.py
│
├── routers/                 # FastAPI APIRouter modules
│   ├── student.py           # /students  — legacy CRUD
│   ├── user.py              # /users     — full user CRUD
│   ├── role.py              # /roles     — role CRUD
│   ├── admin_group.py       # /admin-groups
│   ├── service.py           # /services
│   ├── permission.py        # /permissions
│   └── admin.py             # /admin     — admin-only operations
│
└── client/                  # React frontend (Create React App)
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js           # Root component; all views + API calls
        ├── App.css          # Design system (CSS variables, layout, components)
        └── index.js         # React entry point
```

---

## Data Models

### User

The `User` collection mirrors the following schema. All `*_id` FK references store the MongoDB `ObjectId` of the related document as a plain string.

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `_id` | ObjectId | PK | Auto-generated by MongoDB |
| `role_id` | string | FK → roles | Assigned role |
| `admin_group_id` | string | FK → admin_groups | Admin group membership |
| `service_id` | string | FK → services | Allocated service |
| `permission_id` | string | FK → permissions | Direct permission override |
| `full_name` | string | required | Display name |
| `email` | string | unique, required | Login identifier |
| `password_hash` | string | | Hashed credential (store only hashes) |
| `phone` | string | | Contact number |
| `address` | string | | Street address |
| `city` | string | | City |
| `state` | string | | State / province |
| `country` | string | | Country |
| `date_of_birth` | string (ISO 8601) | | `YYYY-MM-DD` |
| `profile_image_url` | string | | Avatar URL |
| `nin` | string | | National Identification Number |
| `specialization` | string | | Academic / professional field |
| `marketing_consent` | boolean | default `false` | GDPR marketing flag |
| `is_active` | boolean | default `true` | Account enabled flag |
| `is_available` | boolean | default `true` | Availability flag |
| `verification_status` | enum | default `pending` | `pending` · `verified` · `rejected` · `suspended` |
| `verification_token` | string | | Randomly generated on create |
| `email_verified_at` | datetime | | Set when admin verifies |
| `created_at` | datetime | | Set on insert |
| `updated_at` | datetime | | Updated on every write |
| `last_login_at` | datetime | | Updated via `/admin/users/{id}/record-login` |

### Role

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | PK |
| `name` | string (unique) | e.g. `"admin"`, `"editor"`, `"viewer"` |
| `description` | string | Human-readable description |
| `is_active` | boolean | Whether the role is in use |
| `created_at` / `updated_at` | datetime | Audit timestamps |

### AdminGroup

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | PK |
| `name` | string (unique) | Group name |
| `description` | string | |
| `permission_ids` | string[] | List of permission ObjectIds this group holds |
| `is_active` | boolean | |
| `created_at` / `updated_at` | datetime | |

### Service

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | PK |
| `name` | string (unique) | Service name |
| `description` | string | |
| `endpoint` | string | Base URL or path for the service |
| `is_active` | boolean | |
| `created_at` / `updated_at` | datetime | |

### Permission

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | PK |
| `name` | string (unique) | e.g. `"read:users"` |
| `resource` | string | Target resource, e.g. `"users"` |
| `action` | string | `"read"` · `"write"` · `"delete"` · `"admin"` |
| `description` | string | |
| `created_at` / `updated_at` | datetime | |

### Student (legacy)

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | PK |
| `fname` / `lname` | string | Name |
| `age` | int | |
| `level` | string | e.g. `"300L"` |
| `email` | string | |
| `gpa` / `cgpa` | float | Academic scores |

---

## API Reference

Interactive docs are available at [`http://localhost:8000/docs`](http://localhost:8000/docs) (Swagger UI) and [`http://localhost:8000/redoc`](http://localhost:8000/redoc) when the server is running.

### Students — `/students`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/students/get` | List all students |
| `GET` | `/students/get/{id}` | Get a student by ID |
| `POST` | `/students/create` | Create a student |
| `PUT` | `/students/update/{id}` | Update a student |
| `DELETE` | `/students/delete/{id}` | Delete a student |

### Users — `/users`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/get` | List all users |
| `GET` | `/users/get/{id}` | Get a user by ID |
| `POST` | `/users/create` | Create a user (auto-generates `verification_token`, `created_at`) |
| `PUT` | `/users/update/{id}` | Update any user field (partial update; auto-sets `updated_at`) |
| `DELETE` | `/users/delete/{id}` | Permanently delete a user |

### Roles — `/roles`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/roles/get` | List all roles |
| `GET` | `/roles/get/{id}` | Get a role by ID |
| `POST` | `/roles/create` | Create a role |
| `PUT` | `/roles/update/{id}` | Update a role |
| `DELETE` | `/roles/delete/{id}` | Delete a role |

### Admin Groups — `/admin-groups`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin-groups/get` | List all groups |
| `GET` | `/admin-groups/get/{id}` | Get a group by ID |
| `POST` | `/admin-groups/create` | Create a group |
| `PUT` | `/admin-groups/update/{id}` | Update a group |
| `DELETE` | `/admin-groups/delete/{id}` | Delete a group |

### Services — `/services`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/services/get` | List all services |
| `GET` | `/services/get/{id}` | Get a service by ID |
| `POST` | `/services/create` | Create a service |
| `PUT` | `/services/update/{id}` | Update a service |
| `DELETE` | `/services/delete/{id}` | Delete a service |

### Permissions — `/permissions`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/permissions/get` | List all permissions |
| `GET` | `/permissions/get/{id}` | Get a permission by ID |
| `POST` | `/permissions/create` | Create a permission |
| `PUT` | `/permissions/update/{id}` | Update a permission |
| `DELETE` | `/permissions/delete/{id}` | Delete a permission |

### Admin — `/admin`

All routes here perform privileged operations on users. In a production system these should be protected by an authentication middleware.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/stats` | Aggregate counts: users (total/active/inactive/available), verification breakdown, plus role/group/service/permission totals |
| `GET` | `/admin/users` | Full user list (admin view) |
| `GET` | `/admin/users/active` | Active users only (`is_active: true`) |
| `GET` | `/admin/users/inactive` | Inactive / deactivated users |
| `GET` | `/admin/users/unverified` | Users with `verification_status: pending` |
| `GET` | `/admin/users/by-role/{role_id}` | Users filtered by role FK |
| `GET` | `/admin/users/by-group/{group_id}` | Users filtered by admin group FK |
| `PATCH` | `/admin/users/{id}/toggle-status` | Flip `is_active` true ↔ false |
| `PATCH` | `/admin/users/{id}/verify` | Set `verification_status: verified` + stamp `email_verified_at` |
| `PATCH` | `/admin/users/{id}/suspend` | Set `verification_status: suspended` + deactivate |
| `PATCH` | `/admin/users/{id}/assign-role/{role_id}` | Write `role_id` FK onto the user |
| `PATCH` | `/admin/users/{id}/assign-group/{group_id}` | Write `admin_group_id` FK onto the user |
| `PATCH` | `/admin/users/{id}/assign-service/{service_id}` | Write `service_id` FK onto the user |
| `PATCH` | `/admin/users/{id}/record-login` | Stamp `last_login_at` with the current UTC time |

---

## Environment Variables

Create a `.env` file at the repository root (next to `main.py`) before starting the backend. `python-dotenv` loads it automatically via `config.py`.

```dotenv
# MongoDB connection string — local or Atlas
MONGODB_API_URL=mongodb://localhost:27017
```

Create a `.env` file inside `client/` for the frontend:

```dotenv
# Base URL of the FastAPI server — no trailing slash
REACT_APP_API_URL=http://localhost:8000
```

If `REACT_APP_API_URL` is omitted the frontend falls back to `http://localhost:8000` in the API Endpoints view, but Axios will have an undefined base URL so the variable **must** be set for API calls to work.

---

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm 9+
- MongoDB 6+ running locally **or** a MongoDB Atlas connection string

### 1 — Clone and enter the project

```bash
git clone <repo-url>
cd FARM-stack-project
```

### 2 — Backend setup

```bash
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create the environment file
echo "MONGODB_API_URL=mongodb://localhost:27017" > .env

# Start the development server (auto-reload on file changes)
uvicorn main:app --reload
```

The API is now available at `http://localhost:8000`.  
Swagger UI: `http://localhost:8000/docs`

### 3 — Frontend setup

```bash
cd client

# Install dependencies
npm install

# Create the environment file
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start the development server
npm start
```

The React app opens at `http://localhost:3000`.

---

## Frontend

The dashboard is a React SPA with three views accessible from a fixed sidebar.

### Dashboard

Displays four live stat cards computed from the students collection:

- Total Students
- Average GPA
- Average CGPA
- Active Levels (distinct values)

Below the cards, Quick Action buttons navigate to the Students or API Endpoints views. A "Recent Records" list previews the five most recently fetched students.

### Students

A two-column layout:

- **Left — Form**: Add or edit a student record. The form title, mode badge, and submit button label all update to reflect whether you are creating (`New`) or editing (`Editing`). Validation is handled natively by the browser via `required` attributes and `type="number"` / `type="email"` inputs.
- **Right — Table**: Lists all records with avatar initials, level badge, GPA/CGPA chips, and Edit/Delete actions. Edit loads the record into the form and scrolls to the top.

### API Endpoints

Lists all 35 REST routes grouped by resource (Students · Users · Roles · Admin Groups · Services · Permissions · Admin). Each card shows the HTTP method badge (colour-coded), the path, and a description. Routes that map to a UI action include a **Try it →** button that navigates to the relevant view.

### Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--beige` | `#F5F5DC` | Page background |
| `--forest` | `#2C4A3E` | Sidebar, primary buttons, avatars |
| `--forest-light` | `#3D6358` | Button hover state |
| `--amber` | `#C8860A` | Active nav item, level tags, edit badge |
| `--card-bg` | `#FDFCF4` | Card and topbar background |

All values are defined as CSS custom properties in `App.css` and referenced throughout — update a single variable to retheme the entire UI.

---

## Database Layout

```
MongoDB
│
├── StudentDB
│   └── students          ← Student documents
│
└── UserDB
    ├── users             ← User documents (27 fields)
    ├── roles             ← Role definitions
    ├── admin_groups      ← Admin group definitions + permission_ids
    ├── services          ← Service registry
    └── permissions       ← Permission definitions (resource + action)
```

MongoDB generates `_id` (ObjectId) automatically on every insert. All serialiser functions in `schemas/` convert `_id` to a plain string before returning it to the client so the frontend never handles BSON types directly.

---

## Design Decisions

**Why two separate Pydantic models (`CreateX` / `UpdateX`) per entity?**  
Create models enforce required fields at the API boundary. Update models make every field `Optional` so clients can send partial payloads — a `PUT` that omits a field simply leaves it unchanged rather than overwriting it with `None`.

**Why store FK references as strings instead of embedded documents?**  
Embedding copies of referenced documents couples collections tightly and complicates updates. Storing the ObjectId string keeps documents small and lets each entity evolve independently. Joins are done in application code when needed, which is the idiomatic MongoDB pattern for moderately relational data.

**Why keep `/students` alongside `/users`?**  
The original student CRUD endpoints are preserved for backwards compatibility. The `User` model adds profile, location, audit, and access-control fields that the narrow `Student` model does not carry. Rather than a breaking migration, both coexist until the student-specific frontend is migrated to the richer user API.

**Why no authentication middleware yet?**  
The admin routes (`/admin/*`) are intentionally unprotected at this stage to keep the codebase focused on data modelling. The recommended next step is to add an OAuth2/JWT dependency (e.g. `python-jose`, `passlib`) and a `Depends(get_current_admin_user)` guard on the admin router.

**Why plain CSS instead of a component library?**  
A single `App.css` file with CSS custom properties gives full control over the beige/forest-green design system without shipping a large third-party dependency. The file is ~400 lines and covers the complete layout, components, and responsive breakpoints.
