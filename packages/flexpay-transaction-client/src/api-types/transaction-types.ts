import { Address } from "./common-types";
import { CardType, GatewayType, PaymentMethodType, StorageState, TransactionStatus, TransactionType } from "./enum-types";

export interface Transaction {
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
	"gatewaySpecificFields": GatewaySpecificFields;
	"gatewaySpecificResponseFields": GatewaySpecificResponseFields;
}

export interface TransactionListItem {
	"transactionId": string;
	"transactionDate": Date;
	"transactionStatus": TransactionStatus;
	"transactionType": TransactionType;
	"message": string;
	"gateway": Gateway;	// DOCERROR -- the properties in Gateway are not nested in a Transaction (they are just top level)
	"gatewaySpecificFields": GatewaySpecificFields;
	"gatewaySpecificResponseFields": GatewaySpecificResponseFields;
}

export interface Response {
	"avsCode": string;
	"avsMessage": string;
	"cvvCode": string;
	"cvvMessage": string;
	"errorCode": string;
	"errorDetail": string;
}

export interface TransactionPaymentMethod {
	"paymentMethodId": string|null;
	"creditCardNumber": string;
	"expiryMonth": string;
	"expiryYear": string;
	"cvv": string|null;
	"firstName": string|null;
	"lastName": string|null;
	"fullName": string|null;
	"customerId": string;
	"address1": string;
	"address2": string|null;
	"postalCode": string;
	"city": string;
	"state": string;
	"country": string;
	"email": string;
	"phoneNumber": string;
	"paymentMethodType": PaymentMethodType;
	"fingerprint": string|null;
	"lastFourDigits": string;
	"firstSixDigits": string;
	"cardType": CardType;
	"dateCreated": Date|null;
	"storageState": StorageState|null;
}

export interface GatewaySpecificFieldsNested extends Record<string, unknown> { }

export interface GatewaySpecificFields {
	"gatewaySpecificFields": GatewaySpecificFieldsNested;	// DOCERROR -- it is odd to nest the same name property inside
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
