import { CardType, EngagedRecoverState, GatewayType, PaymentMethodType, PaymentModel, ResponseCode, StorageState, TransactionStatus, TransactionType } from "./enum-types";

export interface AddressRequest {
	address1: string;
	address2: string|null;
	postalCode: string;
	city: string;
	state: string;
	country: string;
}

export interface PaymentMethodRequest {
	merchantAccountReferenceId?: string | null;
	creditCardNumber: string;
	expiryMonth: string;
	expiryYear: string;
	cvv?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	fullName?: string | null;
	address1?: string | null;
	address2?: string | null;
	postalCode: string;
	city: string;
	state: string;
	country?: string | null;
	email?: string | null;
	phoneNumber?: string | null;
}

export interface GatewayPaymentMethodRequest {
	gatewayPaymentMethodId?: string | null;
	merchantAccountReferenceId?: string | null;
	firstSixDigits?: string | null;
	lastFourDigits?: string | null;
	//expiryMonth: string;	// FIXME -- this property appears in the code example but not in the body definition
	//expiryYear: string;	// FIXME -- this property appears in the code example but not in the body definition
	firstName?: string | null;
	lastName?: string | null;
	fullName?: string | null;
	address1?: string | null;
	address2?: string | null;
	postalCode: string;
	city: string;
	state: string;
	country?: string | null;
	email?: string | null;
	phoneNumber?: string | null;
}

export interface PaymentPlanRequest {
	sku?: string | null;
	category?: string | null;
	billingPlan?: string | null;
	billingCycle?: number | null;
}

export interface BaseTransactionRequest {
	merchantTransactionId: string;
	orderId: string;
	description?: string | null;
	customerId?: string | null;
	currencyCode: string;
	amount: number;
	customerIp?: string | null;
	shippingAddress?: AddressRequest | null;
	gatewayToken?: string | null;
	paymentPlan?: PaymentPlanRequest | null;
	retryCount: number;
	dateFirstAttempt?: Date | null;
	disableCustomerRecovery?: boolean | null;
	referenceData?: string | null;
	customVariable1?: string | null;
	customVariable2?: string | null;
	customVariable3?: string | null;
	customVariable4?: string | null;
	customVariable5?: string | null;
	paymentModel?: PaymentModel | null;
	References?: {	// This is capitalized in the body definition (does not appear in the example code)
		PreviousTransaction?: {	// FIXME -- Capitalized?
			merchantAccountReferenceId: string | null;
			gatewayCode: string | null;
			gatewayMesage: string | null;
			transactionDate: Date | null;
		} | null;
	} | null;
}

export interface BaseCreditCardRequest extends BaseTransactionRequest {
	retainOnSuccess: boolean;
	paymentMethod: PaymentMethodRequest;
}

export interface BaseTokenizedPaymentMethodRequest extends BaseTransactionRequest {
	paymentMethodId: string;
}

export interface BaseGatewayPaymentMethodRequest extends BaseTransactionRequest {
	paymentMethod: GatewayPaymentMethodRequest;
}

export interface AddressResponse {
	address1: string | null;
	address2: string | null;
	postalCode: string | null;
	city: string | null;
	state: string | null;
	country: string | null;
}

export interface VerificationResponse {
	avsCode: string | null;
	avsMessage: string | null;
	cvvCode: string | null;
	cvvMessage: string | null;
	errorCode: string | null;
	errorDetail: string | null;
}

export interface PaymentMethodResponse {
	paymentMethodId: string;
	creditCardNumber: string | null;
	expiryMonth: string | null;
	expiryYear: string | null;
	cvv: string | null;
	firstName: string | null;
	lastName: string | null;
	fullName: string | null;
	customerId: string;
	address1: string | null;
	address2: string | null;
	postalCode: string | null;
	city: string | null;
	state: string | null;
	country: string | null;
	email: string | null;
	phoneNumber: string | null;
	paymentMethodType: PaymentMethodType;
	fingerprint: string | null;
	lastFourDigits: string;
	firstSixDigits: string;
	cardType: CardType | null;
	dateCreated: Date;
	storageState: StorageState;
}

export interface GatewayPaymentMethodResponse extends PaymentMethodResponse {
	gatewayPaymentMethodId: string;
	merchantAccountReferenceId: string;
}

export interface BaseTransactionResponse {
	response: VerificationResponse;
	paymentMethod: PaymentMethodResponse;
	transactionId: string;
	transactionDate: Date;
	transactionStatus: TransactionStatus;
	message: string;
	responseCode: ResponseCode;
	transactionType: TransactionType;
	merchantTransactionId: string;
	customerId: string;
	currencyCode: string;
	amount: number;
	gatewayToken: string | null;
	gatewayType: GatewayType | null;
	gatewayTransactionId: string | null;
	merchantAccountReferenceId: string;
	assignedGatewayToken: string;
	orderId: string | null;
	retryDate: Date | null;
	retryCount: number;
	dateFirstAttempt: Date | null;
	description: string | null;
	customerIp: string | null;
	shippingAddress: AddressResponse;
	referenceData: string;
	disableCustomerRecovery: boolean;
	engagedRecoveryState: EngagedRecoverState;
	customVariable1: string | null;
	customVariable2: string | null;
	customVariable3: string | null;
	customVariable4: string | null;
	customVariable5: string | null;
	paymentModel?: PaymentModel | null;
}

export interface GatewayTransactionResponse extends BaseTransactionResponse {
	paymentMethod: GatewayPaymentMethodResponse;
}
