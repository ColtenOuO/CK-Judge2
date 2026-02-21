#!/bin/bash

cd "$(dirname "$0")"

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "[-] Error: Environment file not found at $ENV_FILE"
    exit 1
fi

ADMIN_KEY=$(grep '^ADMIN_KEY=' "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d "'")

if [ -z "$ADMIN_KEY" ]; then
    echo "[-] Error: ADMIN_KEY is not defined in $ENV_FILE"
    exit 1
fi

echo "[*] Found ADMIN_KEY, sending request to http://127.0.0.1:8000/api/v1/auth/reset-superuser..."

RESPONSE=$(curl -s -X POST "http://127.0.0.1:8000/api/v1/auth/reset-superuser" \
    -H "Content-Type: application/json" \
    -d "{\"admin_key\": \"$ADMIN_KEY\"}")

echo "[*] Response from server:"
if command -v jq &> /dev/null; then
    echo "$RESPONSE" | jq
elif command -v python3 &> /dev/null; then
    echo "$RESPONSE" | python3 -m json.tool
else
    echo "$RESPONSE"
fi
