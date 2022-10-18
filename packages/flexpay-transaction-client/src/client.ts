import * as Errors from "./errors";
import fetch, { Response } from "node-fetch";
import { ClientOptions, RequestOptions, defaultRequestOptions } from "./client-types";

export class TransactionClient {
	private baseUrl:string;
	private authorizationToken:string;
	private apiVersion = "/v1";
	private debugOutput = false;

	constructor(options:ClientOptions) {
		if (options.baseUrl !== undefined) {
			const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl.slice(0, -1) : options.baseUrl;	// remove trailing slash

			if (!this.isUrl(baseUrl)) throw new Errors.ArgumentError("baseUrl is invalid.");

			this.baseUrl = baseUrl;
		} else {
			this.baseUrl = "https://api.flexpay.io";
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (options.authorizationToken === undefined) throw new Errors.ArgumentError("authorizationToken is invalid");

		this.authorizationToken = options.authorizationToken;
		this.debugOutput = options.debugOutput ?? false;
	}

	/**
	 * Get the baseUrl
	 */
	public getBaseUrl():string {
		return this.baseUrl;
	}

	/**
	 * Set the authorization token. Used by all future requests.
	 */
	public setAuthorizationToken(authorizationToken:string):void {
		this.authorizationToken = authorizationToken;
	}

	// If there is a network response with JSON then a tuple is returned (boolean success, object jsonContent). If any exceptions are thrown they are not handled by this method.
	public async executeRequest<T>(uri:string, method:string, options?:RequestOptions, requestBody?:unknown, queryParameters?:Record<string, string|undefined>|undefined):Promise<T> {
		options = Object.assign({}, defaultRequestOptions, options ?? {});	// supply default options

		if (options.prefixApiVersion) {
			uri = this.apiVersion + uri;
		}

		let qp = "";
		if (queryParameters) {
			const cleanedQP = {} as Record<string, string>;
			for (const [k, v] of Object.entries(queryParameters)) {
				if (v != undefined) {
					cleanedQP[k] = v;
				}
			}

			qp = "?" + (new URLSearchParams(cleanedQP)).toString();
		}

		let requestData:string|undefined;
		if (requestBody) {
			requestData = (typeof requestBody === "string") ? requestBody : JSON.stringify(requestBody);
		}

		let responseBodyText:string|undefined = undefined;
		let responseJson:unknown = undefined;

		let response:Response|undefined;

		try {
			const url = this.baseUrl + uri + qp
			this.debugOutput && console.debug("Request URL:", url);

			response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Basic ${this.authorizationToken}`,
				},
				body: requestData,
			});
			responseBodyText = await response.text();
		} catch (ex) {
			throw new Errors.FetchError((ex as Error).message, { cause: ex });
		}

		this.debugOutput && console.debug("STATUS:", response.status);
		this.debugOutput && console.debug("BODY:", responseBodyText);

		if (response.status === 401 || response.status === 403) {	// AWS HTTP API Gateway returns 403 from the authorizer (instead of 401) if the credentials are invalid
			throw new Errors.AuthorizationError("Authorization Failed");
		} else if (response.status === 404) {
			throw new Errors.ResponseError("Resource not found");
		}

		if (response.status != 200) {
			throw new Errors.ResponseError(responseBodyText);
		}

		try {
			responseJson = responseBodyText && JSON.parse(responseBodyText);
		} catch (ex) {
			throw new Errors.ResponseError("Invalid response content", { cause: responseBodyText});
		}

		if (responseJson === undefined) throw new Errors.ResponseError("Invalid response content", { cause: { responseStatus: response.status, responseBody: "" } });

		return this.processResponse(responseJson, options.entityContainerPropertyName, options.listPropertyName);
	}

	// Pull the requested entity out of the response so we can return simple objects or arrays
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private processResponse<T>(responseJson:any, entityContainerPropertyName:string|undefined, listPropertyName: string|undefined):T {

		if (listPropertyName) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
			responseJson = responseJson[listPropertyName] as any[];

			if (entityContainerPropertyName) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
				return responseJson.map((a:any) => a[entityContainerPropertyName]) as T;
			} else {
				return responseJson as T;
			}
		}

		if (entityContainerPropertyName) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				return responseJson[entityContainerPropertyName] as T;
		} else {
			return responseJson as T;
		}

	}

	protected isUrl(value:string):boolean {
		try {
			const url = new URL(value);
			return url.protocol === "http:" || url.protocol === "https:";
		} catch {
			return false;
		}
	}

	public constrainPageSize(size:number):number {
		if (size < 1) return 1;
		if (size > 100) return 100;

		return size;
	}
}
