# Backend Smoke Test API

This smoke test script validates the core backend flow end-to-end using `curl`.

## Preconditions

1. Backend is running locally.
2. Database is reachable and migrations are applied.
3. `curl` is installed.
4. `jq` is recommended.

## Base URL

Default:

```text
http://localhost:4000/api
```

Override with environment variable:

```bash
BASE_URL="http://localhost:4000/api" ./scripts/smoke-test-api.sh
```

## jq vs fallback

- If `jq` is available, the script parses JSON fields reliably.
- If `jq` is not available, the script uses a basic `sed` fallback for token/id extraction.
- Fallback is best-effort and less robust; install `jq` for stable results.

## Run

```bash
cd backend
bash ./scripts/smoke-test-api.sh
```

## Flow Covered

1. Health check
2. Register user
3. Login user
4. Store JWT token
5. Create project
6. Create two artifacts
7. Create relation between artifacts
8. Fetch project graph
9. Upsert documentation for artifact
10. Run validation
11. Fetch validation issues
12. Create JSON export
13. Fetch export