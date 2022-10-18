export interface ClientOptions {
	authorizationToken: string;
	baseUrl?: string | undefined;
	debugOutput?: boolean;
}

export enum SortOrder {
	Ascending = "asc",
	Descending = "desc",
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
