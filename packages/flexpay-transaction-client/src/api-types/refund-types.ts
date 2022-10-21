import { BaseTransactionResponse } from "./common-types";

export interface RefundRequest {
	merchantTransactionId: string;
	amount?: number,
	disableCustomerRecovery?: boolean;
}

export interface RefundResponse extends BaseTransactionResponse  { }
// Note: According to the documentation this response does not include paymentModel but is otherwise the same as BaseTransactionResponse
