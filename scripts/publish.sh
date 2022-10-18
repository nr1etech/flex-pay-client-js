#!/bin/bash
set -e

if [[ -z "$NPM_AUTH_TOKEN" ]]; then
	echo "NPM_AUTH_TOKEN is not set. Publish aborted." >&2
	exit 1;
fi

./scripts/clean-artifacts.sh
./scripts/build.sh

npx lerna publish
