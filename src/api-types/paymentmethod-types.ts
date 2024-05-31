import { GatewayPaymentMethodResponse, PaymentMethodResponse } from "./common-types";
import { ResponseCode, TransactionStatus, TransactionType } from "./enum-types";

export interface TokenizeCreditCardPaymentMethodRequest {
	customerId: string | null;
	creditCard: {
		creditCardNumber: string;
		expiryMonth: string;
		expiryYear: string;
		cvv: string | null;
		firstName: string;
		lastName: string;
		fullName: string | null;
		address1: string;
		address2: string | null;
		postalCode: string;
		city: string;
		state: string;
		country: string;
		email: string | null;
		phoneNumber: string | null;
	};
}

export interface BasePaymentMethodResponse {
	transactionId: string;
	transactionDate: Date;
	transactionStatus: TransactionStatus;
	message: string;
	responseCode: ResponseCode,
	transactionType: TransactionType;
	customerId: string;
}

export interface TokenizeCreditCardPaymentMethodResponse extends BasePaymentMethodResponse {
	paymentMethod: PaymentMethodResponse;
}

export interface TokenizeGatewayPaymentMethodRequest {
	customerId: string;
	gatewayPaymentMethod: {
		gatewayPaymentMethodId: string;
		merchantAccountReferenceId: string;
		firstName: string;
		lastName: string;
		fullName: string|null;
		address1: string;
		address2: string|null;
		postalCode: string;
		city: string;
		state: string;
		country: string;
		email: string|null;
		phoneNumber: string|null;
		expiryMonth: string;
		expiryYear: string;
		firstSixDigits: string|null;
		lastFourDigits: string|null;
	};
}

export interface TokenizeGatewayPaymentMethodResponse extends BasePaymentMethodResponse {
	paymentMethod: GatewayPaymentMethodResponse;
}

export interface PaymentMethodListItem extends PaymentMethodResponse { }

export interface UpdatePaymentMethodRequest {
	expiryMonth?: string;
	expiryYear?: string;
	firstName?: string | null;
	lastName?: string | null;
	fullName?: string | null;
	address1?: string;
	address2?: string | null;
	postalCode?: string;
	city?: string | null;
	state?: string | null;
	country?: string;
	email?: string | null;
	phoneNumber?: string | null;
}

export interface UpdatePaymentMethodResponse extends BasePaymentMethodResponse {
	paymentMethod: PaymentMethodResponse;
}

export interface RedactPaymentMethodResponse extends BasePaymentMethodResponse {
	paymentMethod: PaymentMethodResponse;
//		merchantAccountReferenceId: string;
}

export interface RecachePaymentMethodRequest {
	paymentMethod: {
		creditCard: {
			cvv: string;
		}
	}
}

export interface RecachePaymentMethodResponse extends BasePaymentMethodResponse {
	paymentMethod: PaymentMethodResponse;
}
