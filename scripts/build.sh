#!/bin/bash
set -e

./scripts/clean-artifacts.sh

npm ci --no-fund

npx lerna run tsc
npx lerna run lint
npx lerna run test
