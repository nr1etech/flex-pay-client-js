import { BaseTransactionResponse } from "./common-types";
import { GatewayType, TransactionStatus, TransactionType } from "./enum-types";

export interface TransactionResponse extends BaseTransactionResponse {
	"gatewaySpecificFields": GatewaySpecificFields;
	"gatewaySpecificResponseFields": GatewaySpecificResponseFields;
}

export interface TransactionListItemResponse {
	"transactionId": string;
	"transactionDate": Date;
	"transactionStatus": TransactionStatus;
	"transactionType": TransactionType;
	"message": string;
	"gateway": Gateway;
	"gatewaySpecificFields": GatewaySpecificFields;
	"gatewaySpecificResponseFields": GatewaySpecificResponseFields;
}

export interface GatewaySpecificFieldsNested extends Record<string, unknown> { }

export interface GatewaySpecificFields {
	"gatewaySpecificFields": GatewaySpecificFieldsNested;
}
export interface GatewaySpecificResponseFields {
	"gatewaySpecificFields": GatewaySpecificFieldsNested;
}

export interface Gateway {
	"token": string;
	"gatewayType": GatewayType;
	"name": string;
	"referenceId": string;
}
