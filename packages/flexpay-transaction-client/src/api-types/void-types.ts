import { AddressResponse } from "./common-types";
import { GatewayType, TransactionStatus, TransactionType } from "./enum-types";
import { TransactionPaymentMethod, Response } from "./transaction-types";

export interface VoidRequest {
	"merchantTransactionId": string;
	"disableCustomerRecovery"?: boolean;
}

export interface VoidResponse {
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
	"gatewayTransactionId": string | null;
	"merchantAccountReferenceId": string | null;
	"assignedGatewayToken": string;
	"orderId": string;
	"retryDate": Date;
	"retryCount": number;
	"dateFirstAttempt": Date;
	"description": string | null;
	"customerIp": string | null;
	"shippingAddress": AddressResponse;
	"referenceData": string;
	"disableCustomerRecovery": boolean;
	"customVariable1": string | null;
	"customVariable2": string | null;
	"customVariable3": string | null;
	"customVariable4": string | null;
	"customVariable5": string | null;

	"productSku": string | null;	// FIXME - not in documentation but appears in practice
	"subscriptionId": string | null;	// FIXME - not in documentation but appears in practice
	// Differs from other - paymentModel
	// FIXME -- Differs from Transaction (transaction-types) in only the GatewaySpecificFields properties
}
