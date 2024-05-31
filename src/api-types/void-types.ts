import { BaseTransactionResponse } from "./common-types";

export interface VoidRequest {
	merchantTransactionId: string;
	disableCustomerRecovery?: boolean;
}

export interface VoidResponse extends BaseTransactionResponse  { }
// Note: According to the documentation this response does not include paymentModel but is otherwise the same as BaseTransactionResponse
