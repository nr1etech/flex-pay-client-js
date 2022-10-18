import { AddressResponse } from "./common-types";
import { CardType, GatewayType, PaymentMethodType, PaymentModel, StorageState, TransactionStatus, TransactionType } from "./enum-types";
import { Response } from "./transaction-types";

export interface AuthorizeCreditCardRequest {
	"merchantTransactionId": string;
	"orderId": string;
	"description"?: string | null;
	"customerId"?: string | null;
	"currencyCode": string;
	"amount": number;
	"retainOnSuccess": boolean;
	//"paymentMethodId": null;	// FIXME - not present in the body definition
	"paymentMethod": {
		"merchantAccountReferenceId"?: string | null;	// FIXME - not present in the example code
		"creditCardNumber": string;
		"expiryMonth": string;
		"expiryYear": string;
		"cvv"?: string | null;
		"firstName"?: string | null;
		"lastName"?: string | null;
		"fullName"?: string | null;
		"address1"?: string | null;
		"address2"?: string | null;
		"postalCode": string;
		"city": string;
		"state": string;
		"country"?: string | null;
		"email"?: string | null;
		"phoneNumber"?: string | null; 	// FIXME - body definition does not give length or required
	};
	"customerIp"?: string | null;
	"shippingAddress"?: {
		"address1": string | null;
		"address2": string | null;
		"postalCode": string | null;
		"city": string | null;
		"state": string | null;
		"country": string | null;
	} | null;	// FIXME -- unclear if this level is required in the body definition
	"gatewayToken"?: string | null;	// the body definition gives this as "assignedGatewayToken", verified with FlexPay it is gatewayToken
	"paymentPlan"?: {
		"sku": string | null;
		"category": string | null;
		"billingPlan": string | null;
		"billingCycle": number | null;
	} | null;	// FIXME -- unclear if this level is required in the body definition
	"retryCount": number;
	"dateFirstAttempt"?: Date | null;
	"disableCustomerRecovery"?: boolean | null;
	"referenceData"?: string | null;
	"customVariable1"?: string | null;
	"customVariable2"?: string | null;
	"customVariable3"?: string | null;
	"customVariable4"?: string | null;
	"customVariable5"?: string | null;
	"paymentModel"?: PaymentModel | null;
	"References"?: {	// This is capitalized in the body definition (does not appear in the example code)
		"PreviousTransaction"?: {	// FIXME -- Capitalized?
			merchantAccountReferenceId: string | null;	// says "See note" but there aren't any notes
			gatewayCode: string | null;
			gatewayMesage: string | null;
			transactionDate: string | null;
		} | null;
	} | null;
}

export interface AuthorizeCreditCardResponse {
	"response": Response;
	"paymentMethod": {
		"paymentMethodId": string;
		"creditCardNumber": string;
		"expiryMonth": string;
		"expiryYear": string;
		"cvv": string;
		"firstName": string;
		"lastName": string;
		"fullName": string;
		"customerId": string;
		"address1": string;
		"address2": string;
		"postalCode": string;
		"city": string;
		"state": string;
		"country": string;
		"email": string;
		"phoneNumber": string;
		"paymentMethodType": PaymentMethodType;
		"fingerprint": string;
		"lastFourDigits": string;
		"firstSixDigits": string;
		"cardType": CardType;
		"dateCreated": Date;
		"storageState": StorageState;
	};
	"transactionId": string;
	"transactionDate": Date;
	"transactionStatus": TransactionStatus;
	"message": string;
	"responseCode": string;
	"transactionType": TransactionType
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
	"retryDate": Date | null;
	"retryCount": number;
	"dateFirstAttempt": Date;
	"description": string;
	"customerIp": string;
	"shippingAddress": AddressResponse;
	"referenceData": string;
	"disableCustomerRecovery": boolean;
	"customVariable1": string;
	"customVariable2": string;
	"customVariable3": string;
	"customVariable4": string;
	"customVariable5": string;
	"paymentModel": PaymentModel;
}

export interface AuthorizeTokenizedPaymentMethodRequest {
	"merchantTransactionId": string;
	"orderId": string;
	"description"?: string | null;
	"customerId"?: string | null;
	"currencyCode": string;
	"amount": number;
	//"retainOnSuccess": boolean;	// FIXME -- only appears in the example code
	"paymentMethodId": string;	// Authorize Credit Card differs only here
	"customerIp"?: string | null;
	"shippingAddress"?: {
		"address1": string | null;
		"address2": string | null;
		"postalCode": string | null;
		"city": string | null;
		"state": string | null;
		"country": string | null;
	} | null;
	"gatewayToken"?: string | null;		// the body definition gives this as "assignedGatewayToken", verified with FlexPay it is gatewayToken
	"paymentPlan"?: {
		"sku": string | null;
		"category": string | null;
		"billingPlan": string | null;
		"billingCycle": number | null;
	} | null;
	"retryCount": number;
	"dateFirstAttempt"?: Date | null;
	"disableCustomerRecovery"?: boolean | null;
	"referenceData"?: string | null;
	"customVariable1"?: string | null;
	"customVariable2"?: string | null;
	"customVariable3"?: string | null;
	"customVariable4"?: string | null;
	"customVariable5"?: string | null;
	"paymentModel"?: PaymentModel | null;
	"References"?: {	// This is capitalized in the body definition (does not appear in the example code)
		"PreviousTransaction"?: {	// FIXME -- required? Capitalized?
			merchantAccountReferenceId: string | null;	// says "See note" but there aren't any notes
			gatewayCode: string | null;
			gatewayMesage: string | null;
			transactionDate: Date | null;
		} | null;
	} | null;
}

export interface AuthorizeTokenizedPaymentMethodResponse extends AuthorizeCreditCardResponse {

}

export interface AuthorizeGatewayPaymentMethodRequest {
	"merchantTransactionId": string;
	"orderId": string;
	"description"?: string | null;
	"customerId"?: string | null;
	"currencyCode": string;
	"amount": number;
	//"retainOnSuccess": boolean;	// FIXME - not present in the body definition
	//"paymentMethodId": null;	// FIXME - not present in the body definition
	"paymentMethod": {
		"gatewayPaymentMethodId"?: string | null;	// FIXME - body definition says option if creditCardNumber is passed but never defines creditCardNumber
		"merchantAccountReferenceId"?: string | null;	// FIXME - not present in the example code
		// "expiryMonth": string | null;	// FIXME - does not appear in body definition, just in the example code
		// "expiryYear": string | null;	// FIXME - does not appear in body definition, just in the example code
		"firstSixDigits"?: string | null;
		"lastFourDigits"?: string | null;
		"firstName"?: string | null;
		"lastName"?: string | null;
		"fullName"?: string | null;
		"address1"?: string | null;
		"address2"?: string | null;
		"postalCode": string;
		"city": string;
		"state": string;
		"country"?: string | null;
		"email"?: string | null;
		"phoneNumber"?: string | null; 	// FIXME - body definition does not give length or required
	};
	"customerIp"?: string | null;
	"shippingAddress"?: {
		"address1": string | null;
		"address2": string | null;
		"postalCode": string | null;
		"city": string | null;
		"state": string | null;
		"country": string | null;
	} | null;	// FIXME -- unclear if this level is required in the body definition
	"gatewayToken"?: string | null;	// the body definition gives this as "assignedGatewayToken", verified with FlexPay it is gatewayToken
	"paymentPlan"?: {
		"sku": string | null;
		"category": string | null;
		"billingPlan": string | null;
		"billingCycle": number | null;
	} | null;	// FIXME -- unclear if this level is required in the body definition
	"retryCount": number;
	"dateFirstAttempt"?: Date | null;
	"disableCustomerRecovery"?: boolean | null;
	"referenceData"?: string | null;
	"customVariable1"?: string | null;
	"customVariable2"?: string | null;
	"customVariable3"?: string | null;
	"customVariable4"?: string | null;
	"customVariable5"?: string | null;
	"paymentModel"?: PaymentModel | null;
	"References"?: {	// This is capitalized in the body definition (does not appear in the example code)
		"PreviousTransaction"?: {	// FIXME -- required? Capitalized?
			merchantAccountReferenceId: string | null;	// says "See note" but there aren't any notes
			gatewayCode: string | null;
			gatewayMesage: string | null;
			transactionDate: Date | null;
		} | null;
	} | null;
}

export interface AuthorizeGatewayPaymentMethodResponse {
	"response": Response;
	"paymentMethod": {
		"paymentMethodId": string;
		"creditCardNumber": string;
		"expiryMonth": string;
		"expiryYear": string;
		"cvv": string;
		"firstName": string;
		"lastName": string;
		"fullName": string;
		"customerId": string;
		"address1": string;
		"address2": string;
		"postalCode": string;
		"city": string;
		"state": string;
		"country": string;
		"email": string;
		"phoneNumber": string;
		"paymentMethodType": PaymentMethodType;
		"fingerprint": string;
		"lastFourDigits": string;
		"firstSixDigits": string;
		"cardType": CardType;
		"dateCreated": Date;
		"storageState": StorageState;
		"gatewayPaymentMethodId": string;	// Differs from credit card response
		"merchantAccountReferenceId": string;	// Differs from credit card response
	};
	"transactionId": string;
	"transactionDate": Date;
	"transactionStatus": TransactionStatus;
	"message": string;
	"responseCode": string;
	"transactionType": TransactionType
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
	"retryDate": Date | null;
	"retryCount": number;
	"dateFirstAttempt": Date;
	"description": string;
	"customerIp": string;
	"shippingAddress": AddressResponse;
	"referenceData": string;
	"disableCustomerRecovery": boolean;
	"customVariable1": string;
	"customVariable2": string;
	"customVariable3": string;
	"customVariable4": string;
	"customVariable5": string;
	"paymentModel": PaymentModel;
}
