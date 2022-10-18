import { Address } from "./common-types";
import { GatewayType, TransactionStatus, TransactionType } from "./enum-types";
import { TransactionPaymentMethod } from "./transaction-types";

export interface RefundFullRequest {
	"merchantTransactionId": string;
	"disableCustomerRecovery": boolean | null;
}

export interface RefundFullResponse {
	"response": Response;
	"paymentMethod": TransactionPaymentMethod;
	"transactionId": string;
	"transactionDate": Date;
	"transactionStatus": TransactionStatus;
	"message": string;
	"responseCode": string;
	"transactionType": TransactionType;
	"merchantTransactionId": string;
	"customerId": string;
	"currencyCode": string;
	"amount": number;
	"gatewayToken": string;
	"gatewayType": GatewayType;
	"gatewayTransactionId": string;
	"merchantAccountReferenceId": string;
	"assignedGatewayToken": string;
	"orderId": string;
	"retryDate": Date;
	"retryCount": number;
	"dateFirstAttempt": Date;
	"description": string;
	"customerIp": string;
	"shippingAddress": Address;
	"referenceData": string;
	"disableCustomerRecovery": boolean;
	"customVariable1": string;
	"customVariable2": string;
	"customVariable3": string;
	"customVariable4": string;
	"customVariable5": string;
	// Differs from other - paymentModel
	// FIXME -- Differs from Transaction (transaction-types) in only the GatewaySpecificFields properties
}

export interface RefundPartialRequest {
	"merchantTransactionId": string;
	"disableCustomerRecovery": boolean | null;
	"amount": number;
}

export interface RefundPartialResponse extends RefundFullResponse {

}
