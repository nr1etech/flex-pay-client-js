import { BaseTransactionResponse } from "./common-types";

export interface CaptureRequest {
	"merchantTransactionId": string;
	"amount"?: number;
	"disableCustomerRecovery"?: boolean;
}

export interface CaptureResponse extends BaseTransactionResponse {
	"productSku": string | null;	// FIXME -- not in documentation but returned in practice
	"subscriptionId": string | null;	// FIXME -- not in documentation but returned in practice
 }
// Note: According to the documentation this response does not include paymentModel but is otherwise the same as BaseTransactionResponse
