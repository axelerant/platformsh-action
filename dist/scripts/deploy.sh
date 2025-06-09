#!/usr/bin/env bash
set -euo pipefail

# Set up the private key if we have one.
if [[ -n "${SSH_PRIVATE_KEY:-}" ]]; then
	eval "$(ssh-agent -s)"
	echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - >/dev/null
fi

# Copy known hosts into the SSH config.
mkdir -p ~/.ssh && chmod 0700 ~/.ssh
cat "${KNOWN_HOSTS_PATH}" >>~/.ssh/known_hosts

# Set the remote
platform project:set-remote "${PLATFORM_PROJECT_ID}"

# Fallback for ENVIRONMENT_NAME
[[ -z "${ENVIRONMENT_NAME:-}" ]] && ENVIRONMENT_NAME="$GITHUB_REF_NAME"

# Build CLI options safely
PLATFORM_OPTS=(-vv --activate --target "$ENVIRONMENT_NAME")

if [[ -n "${FORCE_PUSH:-}" ]]; then
	PLATFORM_OPTS+=("--force")
fi

if [[ -n "${PARENT_ENVIRONMENT_NAME:-}" ]]; then
	PLATFORM_OPTS+=("--parent" "$PARENT_ENVIRONMENT_NAME")
fi

# Debug: print args for confirmation
echo "platform push ${PLATFORM_OPTS[*]}"

# Run the push command
platform push "${PLATFORM_OPTS[@]}"
