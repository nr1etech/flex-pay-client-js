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

export interface TokenExHeaders {
	readonly URL: string;
	readonly ApiKey: string;
	readonly TokenExID: string;
	readonly Code: string;
	readonly Message: string;
	readonly RefNumber: string;
}

export const TOKEN_EX_HEADER:TokenExHeaders = {
	URL: "TX_URL",
	ApiKey: "TX_APIKey",
	TokenExID: "TX_TokenExID",
	Code: "tx_Code",
	Message: "tx_Message",
	RefNumber: "tx_refNumber",
};
