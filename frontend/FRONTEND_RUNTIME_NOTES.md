# Frontend Runtime Notes

## Run Frontend

From repository root:

```powershell
cd frontend
npm install
npm run build
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

## Required Environment

Use `.env.example`:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## Backend Dependency

Frontend currently depends on backend for:

- authentication (`/auth/login`, `/auth/register`, `/auth/me`)
- project listing (`/projects`)

If backend is down or DB is unavailable, login/register/dashboard cannot load real data.

## First Connected Workflow Status

Connected and using real API wrappers/store:

1. `/login` uses `auth-store.login()` and backend auth API.
2. `/register` uses `auth-store.register()` and backend auth API.
3. Protected app routes require authenticated state via `ProtectedRoute`.
4. `/dashboard` loads projects from `projectApi.list()` with loading/error states.

## Duplicate API Helper Cleanup

Legacy duplicate helpers moved to:

```text
frontend/_legacy/old-api/
```

Moved files:

- `projects.ts`
- `artifacts.ts`
- `ws.ts`

New source of truth:

```text
frontend/lib/api/*.ts
frontend/stores/auth-store.ts
frontend/lib/websocket/socket-client.ts
```

## Known Build/Install Blockers (Current Environment)

Observed in this environment:

- `npm --prefix frontend ...` resolves incorrectly from repo root.
- direct `npm install` in `frontend/` timed out repeatedly.
- `npm run build` cannot run until dependencies are installed (`next` binary missing).

These are environment/package-install issues, not intentional frontend architecture constraints.