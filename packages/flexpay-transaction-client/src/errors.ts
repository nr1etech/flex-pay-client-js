export interface ErrorOptions { cause: unknown }

// Based on concepts from https://www.bennadel.com/blog/3226-experimenting-with-error-sub-classing-using-es5-and-typescript-2-1-5.htm

interface FlexPayClientError extends Error { }

class FlexPayClientError {
	public name: string;
	public message: string;
	public stack?: string;
	public cause:unknown|undefined;

	constructor(localError:Error, name:string, options:ErrorOptions|undefined) {
		this.name = name;
		this.message = localError.message;
		this.stack = localError.stack;
		this.cause = options?.cause;
	}
}

// When extending the Error object in Javascript the Error constructor creates a new object which breaks the inheritance chain.
// Using prototypical inheritance solves the problem.
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
Object.setPrototypeOf(FlexPayClientError, Object.create(Error.prototype));

export class ArgumentError extends FlexPayClientError {
	private static errorTypeName = "ArgumentError";
	constructor(localError:Error, options?:ErrorOptions) {
		super(localError, ArgumentError.errorTypeName, options);
	}
}

export class AuthorizationError extends FlexPayClientError {
	private static errorTypeName = "AuthorizationError";
	constructor(localError:Error, options?:ErrorOptions) {
		super(localError, AuthorizationError.errorTypeName, options);
	}
}

export class FetchError extends FlexPayClientError {
	private static errorTypeName = "FetchError";
	constructor(localError:Error, options?:ErrorOptions) {
		super(localError, FetchError.errorTypeName, options);
	}
}

export class ResponseError extends FlexPayClientError {
	private static errorTypeName = "ResponseError";
	constructor(localError:Error, options?:ErrorOptions) {
		super(localError, ResponseError.errorTypeName, options);
	}
}
