#!/bin/bash
set -euo pipefail

export SOFTHSM2_CONF=/etc/softhsm/softhsm2.conf
TOKEN_LABEL="kms-token"

# Default PIN for dev (override with secrets in prod)
HSM_SO_PIN="${HSM_SO_PIN}"
HSM_USER_PIN="${HSM_USER_PIN}"

echo "[softhsm] Starting SoftHSM2..."

# Initialize token only if it doesn't exist yet
if ! softhsm2-util --show-slots 2>&1 | grep -q "${TOKEN_LABEL}"; then
    echo "[softhsm] Initializing token '${TOKEN_LABEL}'..."
    softhsm2-util --init-token \
        --free \
        --label "${TOKEN_LABEL}" \
        --so-pin "${HSM_SO_PIN}" \
        --pin "${HSM_USER_PIN}"
    echo "[softhsm] Token initialized."
else
    echo "[softhsm] Token '${TOKEN_LABEL}' already exists."
fi

echo "[softhsm] Slots:"
softhsm2-util --show-slots

# Keep container running — Vault reads the shared library via mounted volume
echo "[softhsm] Ready. Watching token directory..."
exec tail -f /dev/null