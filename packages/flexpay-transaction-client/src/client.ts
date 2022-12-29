import * as Errors from "./errors";
import fetch, { Response } from "node-fetch";
import { ClientOptions, ClientRequestOptions, defaultRequestOptions } from "./client-types";

const base64RE = /^[a-zA-Z0-9+/]+(==?)?$/;

export class TransactionClient {
	private baseUrl:string;
	private apiKey:string;
	private apiVersion = "/v1";
	private debugOutput = false;
	private requestHeaders:Record<string, string>|undefined = undefined;

	constructor(options:ClientOptions) {
		if (options.baseUrl !== undefined) {
			const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl.slice(0, -1) : options.baseUrl;	// remove trailing slash

			if (!this.isUrl(baseUrl)) throw new Errors.ArgumentError("baseUrl is invalid.");

			this.baseUrl = baseUrl;
		} else {
			this.baseUrl = "https://api.flexpay.io";
		}

		if (!this.isValidApiKey(options.apiKey)) throw new Errors.ArgumentError("apiKey is invalid");

		this.apiKey = options.apiKey;
		this.debugOutput = options.debugOutput ?? false;
		this.requestHeaders = options.requestHeaders;
	}

	private isValidApiKey(apiKey:string|undefined):boolean {
		if (apiKey === undefined) return false
		if (!base64RE.test(apiKey)) {	// simple (incomplete) base64 check to fail early on invalid api keys
			return false;
		}

		return true;
	}

	/**
	 * Get the baseUrl
	 */
	public getBaseUrl():string {
		return this.baseUrl;
	}

	/**
	 * Set the api key. Used by all future requests.
	 */
	public setApiKey(apiKey:string):void {
		if (this.isValidApiKey(apiKey)) {
			this.apiKey = apiKey;
		} else {
			throw new Errors.ArgumentError("Invalid API Key");
		}
	}

	// If there is a network response with JSON then a tuple is returned (boolean success, object jsonContent). If any exceptions are thrown they are not handled by this method.
	public async executeRequest<T>(uri:string, method:string, options?:ClientRequestOptions, requestBody?:unknown, queryParameters?:Record<string, string|undefined>|undefined):Promise<T> {
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
			this.debugOutput && console.debug("REQUEST BODY:", requestData);
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
					...this.requestHeaders,
					...options.headers,
					"Content-Type": "application/json",
					"Authorization": `Basic ${this.apiKey}`,
				},
				body: requestData,
			});
			responseBodyText = await response.text();
		} catch (ex) {
			throw new Errors.FetchError((ex as Error).message, { cause: ex });
		}

		this.debugOutput && console.debug("STATUS:", response.status);
		this.debugOutput && console.debug("RESPONSE BODY:", responseBodyText);

		if (response.status === 401 || response.status === 403) {	// AWS HTTP API Gateway returns 403 from the authorizer (instead of 401) if the credentials are invalid
			throw new Errors.AuthorizationError("Authorization Failed");
		} else if (response.status === 404) {
			throw new Errors.ResponseError("Resource not found");
		}

		if (response.status != 200) {
			throw new Errors.ResponseError(responseBodyText);
		}

		try {
			responseJson = responseBodyText && JSON.parse(responseBodyText, this.jsonDateParser);
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

	private reIsoDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|(?:[+-])(?:\d{2}:\d{2}|\d{4}))?$/;
	private jsonDateParser = (key:string, value:unknown):unknown => {
		if (typeof value === 'string') {
			const match = this.reIsoDateFormat.exec(value);

			if (match != null) {
				// Check whether a timezone was specified
				if (match.length < 2 || !match[1]) {
					value += "Z";	// FlexPay returns bare dates/time strings with no timezone information. Append a Z to have JavaScript treat the date string as UTC rather than the local time zone. This is not standard behavior but was added for compatibility with FlexPay's API
				}
				try {
					return new Date(value);
				} catch {
					return value;
				}
			}
		}

		return value;
	}
}
