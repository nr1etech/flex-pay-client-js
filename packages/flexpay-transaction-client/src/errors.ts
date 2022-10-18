export interface ErrorOptions { cause: unknown }

// Based on https://www.bennadel.com/blog/3226-experimenting-with-error-sub-classing-using-es5-and-typescript-2-1-5.htm

interface FlexPayClientError extends Error {
}

class FlexPayClientError {
	public name: string;
	public message: string;
	public stack?: string;
	public cause:unknown|undefined;

	constructor(message:string, name:string, options:ErrorOptions|undefined) {
		this.name = name;
		this.message = message;
		this.stack = (new Error(message)).stack;
		this.cause = options?.cause;
	}
}

// When extending the Error object in Javascript the Error constructor creates a new object which breaks the inheritance chain.
// Using prototypical inheritance solves the problem.
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
Object.setPrototypeOf(FlexPayClientError, Object.create(Error.prototype));

export class ArgumentError extends FlexPayClientError {
	private static errorTypeName = "ResponseError";
	constructor(message:string, options?:ErrorOptions) {
		super(message, ArgumentError.errorTypeName, options);
	}

	public static isArgumentError(error:FlexPayClientError|Error): error is ArgumentError {
		return (error as FlexPayClientError).name === ArgumentError.errorTypeName;
	}
}

export class AuthorizationError extends FlexPayClientError {
	private static errorTypeName = "ResponseError";
	constructor(message:string, options?:ErrorOptions) {
		super(message, AuthorizationError.errorTypeName, options);
	}
	public static isAuthorizationError(error:FlexPayClientError|Error): error is AuthorizationError {
		return (error as FlexPayClientError).name === AuthorizationError.errorTypeName;
	}
}

export class FetchError extends FlexPayClientError {
	private static errorTypeName = "ResponseError";
	constructor(message:string, options?:ErrorOptions) {
		super(message, FetchError.errorTypeName, options);
	}
	public static isFetchError(error:FlexPayClientError|Error): error is FetchError {
		return (error as FlexPayClientError).name === FetchError.errorTypeName;
	}
}

export class ResponseError extends FlexPayClientError {
	private static errorTypeName = "ResponseError";
	constructor(message:string, options?:ErrorOptions) {
		super(message, ResponseError.errorTypeName, options);
	}
	public static isResponseError(error:FlexPayClientError|Error): error is ResponseError {
		return (error as FlexPayClientError).name === ResponseError.errorTypeName;
	}
}
