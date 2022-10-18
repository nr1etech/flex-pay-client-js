import { Config } from "jest";
const config:Config =
{
	verbose: true,
	silent: false,
	noStackTrace: false,
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	testMatch: ['**/*.test.ts'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
		'^.+\\.(js)$': 'babel-jest',
	},
	transformIgnorePatterns: [],
	setupFilesAfterEnv: ["jest-expect-message"]
};

export default config;
