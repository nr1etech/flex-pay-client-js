import { CardType, PaymentMethodType, ResponseCode, StorageState, TransactionStatus, TransactionType } from "./enum-types";

export interface CreateCreditCardPaymentMethodRequest {
	"customerId": string|null;
	"creditCard": {
		"creditCardNumber": string;
		"expiryMonth": string;
		"expiryYear": string;
		"cvv": string|null;
		"firstName": string;
		"lastName": string;
		"fullName": string|null;
		"address1": string;
		"address2": string|null;
		"postalCode": string;
		"city": string;
		"state": string;
		"country": string;
		"email": string|null;
		"phoneNumber": string|null;
	};
}

export interface CreateCreditCardPaymentMethodResponse {
	"transactionId": string;
	"transactionDate": Date;
	"transactionStatus": TransactionStatus;
	"message": string;
	"responseCode": ResponseCode,
	"transactionType": TransactionType;
	"customerId": string;
	"paymentMethod": {
		"paymentMethodId": string;
		"creditCardNumber": string;
		"expiryMonth": string;
		"expiryYear": string;
		"cvv": string|null;
		"firstName": string;
		"lastName": string;
		"fullName": string|null;
		"customerId": string|null;
		"address1": string;
		"address2": string|null;
		"postalCode": string;
		"city": string;
		"state": string;
		"country": string;
		"email": string|null;
		"phoneNumber": string|null;
		"paymentMethodType": PaymentMethodType;
		"fingerprint": string;
		"lastFourDigits": string;
		"firstSixDigits": string;
		"cardType": CardType;
		"dateCreated": Date;
		"storageState": StorageState;
	};
}

export interface CreateTokenizedPaymentMethodRequest {
	"customerId": string;
	"gatewayPaymentMethod": {
		"gatewayPaymentMethodId": string;
		"merchantAccountReferenceId": string;
		"firstName": string;
		"lastName": string;
		"fullName": string|null;
		"address1": string;
		"address2": string|null;
		"postalCode": string;
		"city": string;
		"state": string;
		"country": string;
		"email": string|null;
		"phoneNumber": string|null;
		"expiryMonth": string;
		"expiryYear": string;
		"firstSixDigits": string|null;
		"lastFourDigits": string|null;
	};
}

export interface CreateTokenizedPaymentMethodResponse {
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
		"cardType": CardType|null;
		"dateCreated": Date;
		"storageState": StorageState;
		"gatewayPaymentMethodId": string;
		"merchantAccountReferenceId": string;
	};
	"transactionId": string;
	"transactionDate": Date;
	"transactionStatus": TransactionStatus;
	"message": string;
	"responseCode": string;
	"transactionType": TransactionType;
	"customerId": string;
}

export interface PaymentMethod {
	// FIXME -- api documentation does not specify the return content. These were determined by querying the endpoint.
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
	"address2": string | null;
	"postalCode": string;
	"city": string;
	"state": string;
	"country": string;
	"email": string | null;
	"phoneNumber": string | null;
	"paymentMethodType": PaymentMethodType;
	"fingerprint": string;
	"lastFourDigits": string;
	"firstSixDigits": string;
	"cardType": CardType;
	"dateCreated": Date;
	"storageState": StorageState;
}

export interface PaymentMethodListItem extends PaymentMethod {
	// FIXME -- api documentation does not specify the return content. These were determined by querying the endpoint.
	// Is the same PaymentMethod
}

export interface UpdatePaymentMethodRequest {
	"expiryMonth"?: string;
	"expiryYear"?: string;
	"firstName"?: string | null;
	"lastName"?: string | null;
	"fullName"?: string | null;
	"address1"?: string;
	"address2"?: string | null;
	"postalCode"?: string;
	"city"?: string | null;
	"state"?: string | null;
	"country"?: string;
	"email"?: string | null;
	"phoneNumber"?: string | null;
}

export interface UpdatePaymentMethodResponse {
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
		"cardType": CardType|null;
		"dateCreated": string;
		"storageState": StorageState;
		"merchantAccountReferenceId": string;
	};
	"transactionId": string;
	"transactionDate": string;
	"transactionStatus": TransactionStatus;
	"message": string;
	"responseCode": string;
	"transactionType": TransactionType;
	"customerId": string;
}

export interface RedactPaymentMethodResponse {	// This is the same as UpdatePaymentMethodResponse
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
		"cardType": CardType|null;
		"dateCreated": Date;
		"storageState": StorageState;
		"merchantAccountReferenceId": string;
	};
	"transactionId": string;
	"transactionDate": Date;
	"transactionStatus": TransactionStatus;
	"message": string;
	"responseCode": string;
	"transactionType": TransactionType;
	"customerId": string;
}

export interface RecachePaymentMethodResponse {
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
		"cardType": CardType|null;
		"dateCreated": Date;
		"storageState": StorageState;
		// This return type doesn't include merchantAccountReferenceId property
	};
	"transactionId": string;
	"transactionDate": Date;
	"transactionStatus": TransactionStatus;
	"message": string;
	"responseCode": string;
	"transactionType": TransactionType;
	"customerId": string;
}
