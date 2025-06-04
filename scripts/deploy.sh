#!/usr/bin/env bash

# Set up the private key if we have one.
if [[ -n "$SSH_PRIVATE_KEY" ]]; then
  eval "$(ssh-agent -s)"
  echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
fi

# Copy known hosts into the SSH config.
mkdir -p ~/.ssh && chmod 0700 ~/.ssh
cat "${KNOWN_HOSTS_PATH}" >>~/.ssh/known_hosts

platform project:set-remote "${PLATFORM_PROJECT_ID}"
[[ "$ENVIRONMENT_NAME" == "" ]] && ENVIRONMENT_NAME="$GITHUB_REF_NAME"
PLATFORM_OPTS="-vv --activate --target $ENVIRONMENT_NAME"
if [[ -n "$FORCE_PUSH" ]]; then
  PLATFORM_OPTS="$PLATFORM_OPTS --force"
fi
if [[ -n "$PARENT_ENVIRONMENT_NAME" ]]; then
  PLATFORM_OPTS="$PLATFORM_OPTS --parent $PARENT_ENVIRONMENT_NAME"
fi
platform push "${PLATFORM_OPTS}"
