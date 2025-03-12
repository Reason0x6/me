#!/bin/bash

# Ensure the script is run inside a Git repository
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo "❌ This script must be run inside a Git repository!"
    exit 1
fi

echo "🔍 Scanning repository for potential secrets..."

# Define common regex patterns for secrets
PATTERNS=(
    "API_KEY|SECRET_KEY|TOKEN|PASSWORD|ACCESS_KEY|PRIVATE_KEY"  # Generic keys
    "[A-Za-z0-9_-]*:?[A-Za-z0-9]{32,}"                          # Generic token pattern
    "AKIA[0-9A-Z]{16}"                                          # AWS Access Key
    "sk_live_[0-9a-zA-Z]{24}"                                   # Stripe Live Key
    "[0-9a-zA-Z_-]*:[0-9a-zA-Z_-]{40}"                          # Generic credentials
    "-----BEGIN RSA PRIVATE KEY-----"                           # Private keys
)

# Search current working directory for secrets
echo "📂 Checking working directory..."
grep -rIn --exclude-dir=".git" -E "$(IFS="|"; echo "${PATTERNS[*]}")" . 2>/dev/null

# Search Git history for secrets
echo -e "\n📜 Checking Git history..."
git grep -Iin --all "$(IFS="|"; echo "${PATTERNS[*]}")" 2>/dev/null

echo -e "\n✅ Scan complete."
