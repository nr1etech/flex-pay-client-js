# NetRadius FlexPay Service Javascript Client

This monorepo contains client packages for interfacing with the FlexPay Transaction API.

## Installation

`npm install @netradius/flexplay-transaction-client`


## Developer Notes
Do not add package dependencies using 'npm install'. Use the appropriate `lerna` commands.

The packages should be built using the `npm run build` command. This executes the build script to compile and lint the source.


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
