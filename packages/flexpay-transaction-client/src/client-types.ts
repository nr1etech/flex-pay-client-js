export interface ClientOptions {
	apiKey: string;
	baseUrl?: string | undefined;
	debugOutput?: boolean;
	tokenEx?: TokenExClientOptions;
}

export enum SortOrder {
	Ascending = "asc",
	Descending = "desc",
}

export interface TokenExClientOptions {
	apiUrl: string;
	tokenExID: string;
	apiKey: string;
}

export interface RequestOptions {
	listPropertyName?: string;
	entityContainerPropertyName?: string;
	prefixApiVersion?: boolean;
	isTransactionResponse?: boolean;
}

export const defaultRequestOptions:RequestOptions = {
	listPropertyName: undefined,
	entityContainerPropertyName: undefined,
	prefixApiVersion: true,
	isTransactionResponse: true,
};
