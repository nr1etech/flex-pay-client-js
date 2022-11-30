#!/bin/bash
set -e

cd ./packages/flexpay-transaction-client
npx jest integration/sandbox-env
npx jest integration/sandbox-scenarios
cd -
