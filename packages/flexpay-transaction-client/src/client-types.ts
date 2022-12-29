export interface ClientOptions {
	apiKey: string;
	baseUrl?: string | undefined;
	debugOutput?: boolean;
	requestHeaders?: Record<string, string>;
}

export enum SortOrder {
	Ascending = "asc",
	Descending = "desc",
}

export interface ClientRequestOptions {
	listPropertyName?: string;
	entityContainerPropertyName?: string;
	prefixApiVersion?: boolean;
	isTransactionResponse?: boolean;
	headers?: Record<string, string>;
}

export const defaultRequestOptions:ClientRequestOptions = {
	listPropertyName: undefined,
	entityContainerPropertyName: undefined,
	prefixApiVersion: true,
	isTransactionResponse: true,
	headers: undefined,
};
