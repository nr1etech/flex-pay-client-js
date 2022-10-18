import { AddressResponse } from "./common-types";
import { GatewayType, TransactionStatus, TransactionType } from "./enum-types";
import { TransactionPaymentMethod, Response } from "./transaction-types";

export interface CaptureRequest {
	"amount"?: number;
	"merchantTransactionId": string;
	"disableCustomerRecovery"?: boolean;
}

export interface CaptureResponse {
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
	"gatewayToken": string | null;
	"gatewayType": GatewayType | null;
	"gatewayTransactionId": string | null;
	"merchantAccountReferenceId": string | null;
	"assignedGatewayToken": string | null;
	"orderId": string | null;
	"retryDate": Date | null;
	"retryCount": number;
	"dateFirstAttempt": Date;
	"description": string | null
	"productSku": string | null;	// FIXME -- not in documentation but returned in practice
	"subscriptionId": string | null;	// FIXME -- not in documentation but returned in practice
	"customerIp": string | null;
	"shippingAddress": AddressResponse;
	"referenceData": string;
	"disableCustomerRecovery": boolean;
	"customVariable1": string | null;
	"customVariable2": string | null;
	"customVariable3": string | null;
	"customVariable4": string | null;
	"customVariable5": string | null;
	// Differs from other - paymentModel not included
	// FIXME -- Differs from Transaction (transaction-types) in only the GatewaySpecificFields properties

}
