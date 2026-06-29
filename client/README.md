# Client — React Frontend

Single-page dashboard for the FARM Stack User & Student Management System.

## Stack

- **React 19** — UI library
- **Axios 1.16** — HTTP client
- **Bootstrap 5.3** — Utility CSS (form controls only; layout is custom)
- **Create React App** — Build tooling

## Views

| View | Route trigger | What it shows |
|------|--------------|---------------|
| **Dashboard** | Sidebar → Dashboard | Stat cards (total students, avg GPA/CGPA, active levels), quick-action buttons, recent records list |
| **Students** | Sidebar → Students | Add/edit form (left) + records table (right) |
| **API Endpoints** | Sidebar → API Endpoints | All 35 REST routes grouped by resource, with method badges and "Try it" navigation |

## Setup

```bash
# From the client/ directory
npm install
```

Create a `.env` file in this directory:

```dotenv
REACT_APP_API_URL=http://localhost:8000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the dev server at `http://localhost:3000` |
| `npm run build` | Production build into `build/` |
| `npm test` | Run the test suite |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | Yes | — | Base URL of the FastAPI backend, no trailing slash |

## Project Files

```
client/
├── public/
│   └── index.html
└── src/
    ├── App.js     # Root component — all state, API calls, and view rendering
    ├── App.css    # Full design system (CSS variables, layout, all component styles)
    └── index.js   # React DOM entry point
```

All application logic lives in `App.js`. State is managed with `useState`/`useEffect` hooks. There are no additional routing libraries — view switching is handled by an `activeView` state variable (`'dashboard' | 'students' | 'endpoints'`).

## API Calls

The Axios instance is created once with `process.env.REACT_APP_API_URL` as the base URL. All requests go through this instance:

| Action | Method + path |
|--------|--------------|
| Load all students | `GET /students/get` |
| Add student | `POST /students/create` |
| Update student | `PUT /students/update/{id}` |
| Delete student | `DELETE /students/delete/{id}` |

See the API Endpoints view in the app, or the root `README.md`, for the full list of available backend routes.
