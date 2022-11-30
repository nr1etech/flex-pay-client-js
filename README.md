# Logicl FlexPay Service Javascript Client

This monorepo contains client packages for interfacing with the FlexPay Transaction API.

## Installation

`npm install @logicl/flexplay-transaction-client`


## Developer Notes
Do not add package dependencies using 'npm install'. Use the appropriate `lerna` commands.

The packages should be built using the `npm run build` command. This executes the build script to compile and lint the source.

## Running Unit Tests
Unit tests can be run using the package.json script 'test', e.g., `npm run test`. This will run the `test` script in the packages.

Alternately tests can be run by changing to the package's directory (`./packages/flexpay-transaction-client`) and running the `npx jest unit/` or `npm run test` command.

Tests with verbose output can be run from the package's directory with the `npm run test:loud` command.

## Running Integration Test
Integration tests require the following environment variable to be set before execution:

 - X_FP_GATEWAY_TOKEN - The gateway token configured in the FlexPay account
 - X_FP_API_KEY - A FlexPay API key configured in the FlexPay account
 - X_FP_MERCHANT_ACCOUNT_REFERENCE_ID - The Merchant account reference id from the gateway configured in the FlexPay account

The FlexPay API requires a delay between executing a transaction and performing a follow up transaction (e.g., charge then read, auth then capture). This delay is configurable in the tests. Because of this required delay the tests can take a long time to execute.

The package.json script `npm run integration-test` will execute the 2 sandbox tests and should be run from the project root.

The integration tests can also be executed from the package's directory (`./packages/flexpay-transaction-client`). Use the `npm run test:integration-prod` or `npm run test:integration/sandbox-env` commands. Or the can be executed with the `npx jest` command but you should run specific integration tests rather than the entire subdirectory.

The integration tests have been split into prod and sandbox tests. Some tests will always fail in the FlexPay sandbox environment and so have been split into a set of production tests. Caution should be used when executing production tests.

For more output from the tests use the `npx jest` commandline or modify the jest.config.ts and the package.json scripts. Additionally the FlexPayTransactionClient `debugOutput` options can be modified in the test.

## Publishing to npmjs.org
A `publish` or `automation` token is required and needs to be export in the `NPM_AUTH_TOKEN` environment variable before publishing.

All work must be committed before lerna can will publish. The publishing process will modify the package.json files of the packages with the
next version number and a new commit and tag will be pushed to the git repository.

Execute the publish by running the `npm run publish` command.

## Version bumping from a pre-release
If you've published a -beta or -alpha version to npm and are ready to publish a release version that doesn't require any changes (has no new commits) lerna requires additional commandline parameters in order to publish.

`npx lerna publish --force-publish=[package name]`

The package name value is the `name` value from the package.json.

lerna will then prompt you for the new version number, update the repo, and publish the package.

## `lerna` command summary.
These commands should be run from the project root rather than the package roots.

- `npm install` -- install npm modules for the root and also all the workspaces in /packages. This must be run once after cloning to install the lerna packages.
- `npx lerna bootstrap` -- install all dependencies and will also handle local dependencies (if any).
- `npx lerna create package` -- add a new package to the monorepo with basic scaffolding. You will need to create the tsconfig.json and modify the package.json after the package is created.
- `npx lerna add module ./packages/[package name] [--dev]` -- replaces `npm install module` for packages. If a package path is omitted the module will be added as a dependency in all the packages.
- `npx lerna run tsc`  -- runs the package.json script 'tsc' from all the packages (so you don't have to run them individually).
