#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000/api}"
TS="$(date +%s)"
TEST_EMAIL="smoke_test_${TS}@example.com"
TEST_PASSWORD="StrongPassword123!"
FIRST_NAME="Smoke"
LAST_NAME="Tester"

HAS_JQ=0
if command -v jq >/dev/null 2>&1; then
  HAS_JQ=1
fi

extract_field() {
  local json="$1"
  local path="$2"

  if [[ "$HAS_JQ" -eq 1 ]]; then
    printf '%s' "$json" | jq -r "$path"
  else
    # Best-effort fallback; jq is strongly recommended.
    case "$path" in
      ".data.token") printf '%s' "$json" | sed -n 's/.*"token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' ;;
      ".data.user.id") printf '%s' "$json" | sed -n 's/.*"user".*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' ;;
      ".data.id") printf '%s' "$json" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1 ;;
      *) printf '' ;;
    esac
  fi
}

assert_non_empty() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" || "$value" == "null" ]]; then
    echo "[FAIL] Missing required value: $name"
    exit 1
  fi
}

assert_success_true() {
  local step="$1"
  local json="$2"

  local success
  if [[ "$HAS_JQ" -eq 1 ]]; then
    success="$(printf '%s' "$json" | jq -r '.success // empty')"
  else
    success="$(printf '%s' "$json" | sed -n 's/.*"success"[[:space:]]*:[[:space:]]*\(true\|false\).*/\1/p' | head -n 1)"
  fi

  if [[ "$success" != "true" ]]; then
    echo "[FAIL] $step failed"
    echo "$json"
    exit 1
  fi
}

request() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local auth="${4:-}"

  if [[ -n "$body" && -n "$auth" ]]; then
    curl -sS -X "$method" "$url" -H "Content-Type: application/json" -H "Authorization: Bearer $auth" -d "$body"
  elif [[ -n "$body" ]]; then
    curl -sS -X "$method" "$url" -H "Content-Type: application/json" -d "$body"
  elif [[ -n "$auth" ]]; then
    curl -sS -X "$method" "$url" -H "Authorization: Bearer $auth"
  else
    curl -sS -X "$method" "$url"
  fi
}

echo "[INFO] BASE_URL=$BASE_URL"
if [[ "$HAS_JQ" -eq 1 ]]; then
  echo "[INFO] jq detected"
else
  echo "[WARN] jq not found; using fallback JSON parsing"
fi

echo "\n[1/13] Health check"
HEALTH_JSON="$(request GET "$BASE_URL/health")"
assert_success_true "Health check" "$HEALTH_JSON"

echo "\n[2/13] Register user"
REGISTER_PAYLOAD="$(cat <<JSON
{"email":"$TEST_EMAIL","password":"$TEST_PASSWORD","firstName":"$FIRST_NAME","lastName":"$LAST_NAME"}
JSON
)"
REGISTER_JSON="$(request POST "$BASE_URL/auth/register" "$REGISTER_PAYLOAD")"
assert_success_true "Register user" "$REGISTER_JSON"

echo "\n[3/13] Login user"
LOGIN_PAYLOAD="$(cat <<JSON
{"email":"$TEST_EMAIL","password":"$TEST_PASSWORD"}
JSON
)"
LOGIN_JSON="$(request POST "$BASE_URL/auth/login" "$LOGIN_PAYLOAD")"
assert_success_true "Login user" "$LOGIN_JSON"

echo "\n[4/13] Store JWT token"
TOKEN="$(extract_field "$LOGIN_JSON" '.data.token')"
assert_non_empty "TOKEN" "$TOKEN"

echo "\n[5/13] Create project"
PROJECT_PAYLOAD='{"name":"Smoke Test Project","description":"Backend smoke test project"}'
PROJECT_JSON="$(request POST "$BASE_URL/projects" "$PROJECT_PAYLOAD" "$TOKEN")"
assert_success_true "Create project" "$PROJECT_JSON"
PROJECT_ID="$(extract_field "$PROJECT_JSON" '.data.id')"
assert_non_empty "PROJECT_ID" "$PROJECT_ID"

echo "\n[6/13] Create two artifacts"
ARTIFACT1_PAYLOAD='{"title":"Auth Service","type":"SERVICE","description":"Handles auth","status":"ACTIVE"}'
ARTIFACT1_JSON="$(request POST "$BASE_URL/projects/$PROJECT_ID/artifacts" "$ARTIFACT1_PAYLOAD" "$TOKEN")"
assert_success_true "Create artifact 1" "$ARTIFACT1_JSON"
ARTIFACT1_ID="$(extract_field "$ARTIFACT1_JSON" '.data.id')"
assert_non_empty "ARTIFACT1_ID" "$ARTIFACT1_ID"

ARTIFACT2_PAYLOAD='{"title":"User Repository","type":"MODULE","description":"User persistence layer","status":"ACTIVE"}'
ARTIFACT2_JSON="$(request POST "$BASE_URL/projects/$PROJECT_ID/artifacts" "$ARTIFACT2_PAYLOAD" "$TOKEN")"
assert_success_true "Create artifact 2" "$ARTIFACT2_JSON"
ARTIFACT2_ID="$(extract_field "$ARTIFACT2_JSON" '.data.id')"
assert_non_empty "ARTIFACT2_ID" "$ARTIFACT2_ID"

echo "\n[7/13] Create relation between artifacts"
RELATION_PAYLOAD="$(cat <<JSON
{"sourceArtifactId":"$ARTIFACT1_ID","targetArtifactId":"$ARTIFACT2_ID","relationType":"DEPENDS_ON","description":"Auth service depends on user repo"}
JSON
)"
RELATION_JSON="$(request POST "$BASE_URL/artifacts/$ARTIFACT1_ID/relations" "$RELATION_PAYLOAD" "$TOKEN")"
assert_success_true "Create relation" "$RELATION_JSON"

echo "\n[8/13] Fetch project graph"
GRAPH_JSON="$(request GET "$BASE_URL/projects/$PROJECT_ID/graph" "" "$TOKEN")"
assert_success_true "Fetch graph" "$GRAPH_JSON"

echo "\n[9/13] Upsert documentation for artifact"
DOC_PAYLOAD='{"markdownContent":"# Auth Service\n\nSmoke test documentation."}'
DOC_JSON="$(request PUT "$BASE_URL/artifacts/$ARTIFACT1_ID/documentation" "$DOC_PAYLOAD" "$TOKEN")"
assert_success_true "Upsert documentation" "$DOC_JSON"

echo "\n[10/13] Run validation"
VALIDATE_JSON="$(request POST "$BASE_URL/projects/$PROJECT_ID/validate" "" "$TOKEN")"
assert_success_true "Run validation" "$VALIDATE_JSON"

echo "\n[11/13] Fetch validation issues"
ISSUES_JSON="$(request GET "$BASE_URL/projects/$PROJECT_ID/validation-issues" "" "$TOKEN")"
assert_success_true "Fetch validation issues" "$ISSUES_JSON"

echo "\n[12/13] Create JSON export"
EXPORT_PAYLOAD='{"format":"JSON","sections":["ARTIFACTS","RELATIONS","GRAPH","API_SPECS","DIAGRAMS","VALIDATION_REPORT","VERSION_HISTORY"]}'
EXPORT_JSON="$(request POST "$BASE_URL/projects/$PROJECT_ID/export" "$EXPORT_PAYLOAD" "$TOKEN")"
assert_success_true "Create export" "$EXPORT_JSON"
EXPORT_ID="$(extract_field "$EXPORT_JSON" '.data.id')"
assert_non_empty "EXPORT_ID" "$EXPORT_ID"

echo "\n[13/13] Fetch export"
GET_EXPORT_JSON="$(request GET "$BASE_URL/exports/$EXPORT_ID" "" "$TOKEN")"
assert_success_true "Fetch export" "$GET_EXPORT_JSON"

echo "\n[PASS] Smoke test completed successfully"
echo "[INFO] projectId=$PROJECT_ID"
echo "[INFO] artifact1Id=$ARTIFACT1_ID"
echo "[INFO] artifact2Id=$ARTIFACT2_ID"
echo "[INFO] exportId=$EXPORT_ID"