import { AddressResponse } from "./common-types";
import { CardType, GatewayType, PaymentMethodType, PaymentModel, StorageState, TransactionStatus, TransactionType } from "./enum-types";
import { TransactionPaymentMethod, Response } from "./transaction-types";

export interface ChargeCreditCardRequest {
	"merchantTransactionId": string;
	"orderId": string;
	"description": string | null;
	"customerId": string | null;
	"currencyCode": string;
	"amount": number;
	"retainOnSuccess": boolean;
	//"paymentMethodId": string|null; // FIXME - this field appears in the docs example code but not in the body definition
	"paymentMethod": {
		"merchantAccountReferenceId": string | null;	// FIXME -- this field appears in the body definition but not in the example code
		"creditCardNumber": string;
		"expiryMonth": string;
		"expiryYear": string;
		"cvv": string | null;
		"firstName": string | null;
		"lastName": string | null;
		"fullName": string | null;
		"address1": string | null;
		"address2": string | null;
		"postalCode": string;
		"city": string;
		"state": string;
		"country": string | null;
		"email": string | null;
		"phoneNumber": string | null;	// FIXME - Docs don't specify if this is required nor do they give a max length
	},
	"customerIp": string;
	"shippingAddress": {	// FIXME -- The docs do not specify whether the entire object is optional or it is required but the individiual fields are optional
		"address1": string | null;
		"address2": string | null;
		"postalCode": string | null;
		"city": string | null;
		"state": string | null;
		"country": string | null;
	} | null;
	"gatewayToken"?: string | null;	// FIXME -- this field appears in the example code but doesn't appear in the body definition
	"paymentPlan": {	// FIXME -- The docs do not specify whether the entire object is optional or it is required but the individiual fields are optional
		"sku": string | null;
		"category": string | null;
		"billingPlan": string | null;
		"billingCycle": number | null;
	} | null,
	"retryCount": number,
	"dateFirstAttempt": Date | null;
	"disableCustomerRecovery": boolean | null;
	"referenceData": string | null;
	"customVariable1": string | null;
	"customVariable2": string | null;
	"customVariable3": string | null;
	"customVariable4": string | null;
	"customVariable5": string | null;
	"paymentModel": PaymentModel | null;
	"References": {	// This is capitalized in the body definition (does not appear in the example code)
		"PreviousTransaction": {	// FIXME -- required? Capitalized?
			merchantAccountReferenceId: string | null;	// says "See note" but there aren't any notes
			gatewayCode: string | null;
			gatewayMesage: string | null;
			transactionDate: Date | null;
		};
	};
}

export interface ChargeCreditCardResponse {
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
	"shippingAddress": AddressResponse;
	"referenceData": string;
	"disableCustomerRecovery": boolean;
	"customVariable1": string;
	"customVariable2": string;
	"customVariable3": string;
	"customVariable4": string;
	"customVariable5": string;
	"paymentModel": PaymentModel;
	// FIXME -- Differs from Transaction (transaction-types) in only the GatewaySpecificFields properties
}

export interface ChargeTokenizedPaymentMethodRequest {
	"merchantTransactionId": string;
	"orderId": string;
	"description"?: string | null;
	"customerId"?: string | null;
	"currencyCode": string;
	"amount": number,
	//"retainOnSuccess": boolean, // FIXME -- The body definition does not include this property but the example code does.
	"paymentMethodId": string;
	"customerIp": string|null;
	"shippingAddress"?: {
		"address1": string | null;
		"address2": string | null;
		"postalCode": string | null;
		"city": string | null;
		"state": string | null;
		"country": string | null;
	} | null;
	"gatewayToken"?: string | null;	// the body definition gives this as "assignedGatewayToken", verified with FlexPay it is gatewayToken
	"paymentPlan"?: {
		"sku": string | null;
		"category": string | null;
		"billingPlan": string | null;
		"billingCycle": number | null;
	} | null,
	"retryCount": number,
	"dateFirstAttempt"?: Date | null;
	"disableCustomerRecovery"?: boolean;
	"referenceData"?: string | null;
	"customVariable1"?: string | null;
	"customVariable2"?: string | null;
	"customVariable3"?: string | null;
	"customVariable4"?: string | null;
	"customVariable5"?: string | null;
	"paymentModel"?: PaymentModel | null;
	"References"?: {	// This is capitalized in the body definition (does not appear in the example code)
		"PreviousTransaction"?: {	// FIXME -- Capitalized?
			merchantAccountReferenceId: string | null;
			gatewayCode: string | null;
			gatewayMesage: string | null;
			transactionDate: Date | null;
		} | null;
	} | null;
}

export interface ChargeTokenizedPaymentMethodResponse extends ChargeCreditCardResponse
{

}

export interface ChargeGatewayPaymentMethodRequest {
	"merchantTransactionId": string;
	"orderId": string;
	"description"?: string | null;
	"customerId"?: string | null;
	"currencyCode": string;
	"amount": number;
	//"retainOnSuccess": boolean;	// The body definition does not include this, the code example does.
	//"paymentMethodId": string | null;	// The body definition does not include this, the code example does.
	"paymentMethod": {	// This version of paymentMethod differs from the CreditCard version
		"gatewayPaymentMethodId"?: string | null;	// FIXME -- says optional if creditCardNumber is passed but no property for creditCardNumber is defined
		"merchantAccountReferenceId"?: string | null;	// FIXME -- this field appears in the body definition but not in the example code
		"firstSixDigits"?: string | null;
		"lastFourDigits"?: string | null;
		//"expiryMonth": string;	// FIXME -- this property appears in the code example but not in the body definition
		//"expiryYear": string;	// FIXME -- this property appears in the code example but not in the body definition
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
		"phoneNumber"?: string | null;	// FIXME - Docs don't specify if this is required nor do they give a max length
	},
	"customerIp"?: string | null;
	"shippingAddress"?: {	// FIXME -- The docs do not specify whether the entire object is optional or it is required but the individiual fields are optional
		"address1": string | null;
		"address2": string | null;
		"postalCode": string | null;
		"city": string | null;
		"state": string | null;
		"country": string | null;
	} | null;
	"gatewayToken": string;	// the body definition gives this as "assignedGatewayToken", verified with FlexPay it is gatewayToken
	"paymentPlan"?: {	// FIXME -- The docs do not specify whether the entire object is optional or it is required but the individiual fields are optional
		"sku": string | null;
		"category": string | null;
		"billingPlan": string | null;
		"billingCycle": number | null;
	} | null,
	"retryCount": number,
	"dateFirstAttempt"?: Date | null;
	"disableCustomerRecovery"?: boolean;
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

export interface ChargeGatewayPaymentMethodResponse {
	"response": Response;
	"paymentMethod": {
		"paymentMethodId": string|null;
		"creditCardNumber": string;
		"expiryMonth": string;
		"expiryYear": string;
		"cvv": string|null;
		"firstName": string;
		"lastName": string;
		"fullName": string;
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
		"gatewayPaymentMethodId": string;
		"merchantAccountReferenceId": string;
	};
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
