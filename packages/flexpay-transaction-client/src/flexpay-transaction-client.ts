import {
	TransactionClient, ClientOptions, SortOrder,
	TransactionResponse, TransactionListItemResponse,
	PaymentMethodResponse, PaymentMethodListItem,
	TokenizeCreditCardPaymentMethodResponse, TokenizeCreditCardPaymentMethodRequest, TokenizeGatewayPaymentMethodRequest, TokenizeGatewayPaymentMethodResponse,
	UpdatePaymentMethodRequest, UpdatePaymentMethodResponse,
	RedactPaymentMethodResponse, RecachePaymentMethodRequest, RecachePaymentMethodResponse,
	ChargeCreditCardRequest, ChargeCreditCardResponse, ChargeTokenizedPaymentMethodRequest, ChargeTokenizedPaymentMethodResponse, ChargeGatewayPaymentMethodRequest, ChargeGatewayPaymentMethodResponse,
	AuthorizeCreditCardRequest, AuthorizeCreditCardResponse, AuthorizeTokenizedPaymentMethodRequest, AuthorizeTokenizedPaymentMethodResponse, AuthorizeGatewayPaymentMethodRequest, AuthorizeGatewayPaymentMethodResponse,
	CaptureRequest, CaptureResponse,
	VoidRequest, VoidResponse,
	HealthCheckResponse,
	RefundRequest, RefundResponse,
} from ".";

export interface RequestOptions {
	headers?: Record<string, string>;
}

export class FlexPayTransactionClient {
	public transactions:Transactions;
	public paymentMethods:PaymentMethods;
	public charge:Charge;
	public authorize:Authorize;
	public capture:Capture;
	public void:Void;
	public refund:Refund;
	public healthCheck:HealthCheck;

	private client:TransactionClient;

	constructor(options:ClientOptions) {
		this.client = new TransactionClient(options);

		this.transactions = new Transactions(this.client);
		this.paymentMethods = new PaymentMethods(this.client);
		this.charge = new Charge(this.client);
		this.authorize = new Authorize(this.client);
		this.capture = new Capture(this.client);
		this.void = new Void(this.client);
		this.refund = new Refund(this.client);
		this.healthCheck = new HealthCheck(this.client);
	}

	public getBaseUrl():string {
		return this.client.getBaseUrl();
	}

	public setApiKey(authorizationToken:string):void {
		this.client.setApiKey(authorizationToken);
	}
}

class Transactions {
	constructor(
		private client:TransactionClient
	) { }

	async getTransaction(transactionId:string, requestOptions?:RequestOptions):Promise<TransactionResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}`;

		return await this.client.executeRequest<TransactionResponse>(uri, "GET", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers });
	}

	async getTransactionByMerchantTransactionId(merchantTransactionId:string, requestOptions?:RequestOptions):Promise<TransactionResponse> {
		const uri = `/transactions/byMerchantTransactionId/${encodeURIComponent(merchantTransactionId)}`;

		return await this.client.executeRequest<TransactionResponse>(uri, "GET", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers });
	}

	async getTransactionList(pageId:string|null = null, pageSize:number = 20, sortOrder:SortOrder = SortOrder.Ascending, requestOptions?:RequestOptions):Promise<TransactionListItemResponse[]> {
		const uri = "/transactions";

		pageSize = this.client.constrainPageSize(pageSize);

		const queryParameters = {
			"order": sortOrder.toString(),
			"count": pageSize.toString(),
			"sinceToken": pageId ?? undefined,
		};
		const clientRequestOptions = { listPropertyName: "transactions", entityContainerPropertyName: undefined, headers: requestOptions?.headers };

		return await this.client.executeRequest<TransactionListItemResponse[]>(uri, "GET", clientRequestOptions, undefined, queryParameters);
	}
}

class PaymentMethods {
	constructor(
		private client:TransactionClient
	) { }

	async tokenizeCreditCard(creditCardPaymentMethod:TokenizeCreditCardPaymentMethodRequest, requestOptions?:RequestOptions):Promise<TokenizeCreditCardPaymentMethodResponse> {
		const uri = "/paymentmethods";

		const request = {
			"paymentMethod": creditCardPaymentMethod,
		};

		return await this.client.executeRequest<TokenizeCreditCardPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}

	async tokenizeGatewayPaymentMethod(tokenizedPaymentMethod:TokenizeGatewayPaymentMethodRequest, requestOptions?:RequestOptions):Promise<TokenizeGatewayPaymentMethodResponse> {
		const uri = "/paymentmethods";

		const request = {
			"paymentMethod": tokenizedPaymentMethod,
		};

		return await this.client.executeRequest<TokenizeGatewayPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}

	async getPaymentMethodList(pageId:string|null = null, pageSize:number = 20, sortOrder:SortOrder = SortOrder.Ascending, requestOptions?:RequestOptions):Promise<PaymentMethodListItem[]> {
		const uri = "/paymentmethods";

		pageSize = this.client.constrainPageSize(pageSize);

		const queryParameters = {
			"order": sortOrder.toString(),
			"count": pageSize.toString(),
			"sinceToken": pageId ?? undefined,
		};
		const clientRequestOptions = { listPropertyName: "paymentMethods", entityContainerPropertyName: "paymentMethod", headers: requestOptions?.headers };

		return await this.client.executeRequest<PaymentMethodListItem[]>(uri, "GET", clientRequestOptions, undefined, queryParameters);
	}

	async getPaymentMethod(paymentMethodId:string, requestOptions?:RequestOptions):Promise<PaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}`;

		return await this.client.executeRequest<PaymentMethodResponse>(uri, "GET", { entityContainerPropertyName: "paymentMethod", headers: requestOptions?.headers });
	}

	async updatePaymentMethod(paymentMethodId:string, updatePaymentMethodRequest:UpdatePaymentMethodRequest, requestOptions?:RequestOptions):Promise<UpdatePaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}`;

		const request = {
			"paymentMethod": updatePaymentMethodRequest,
		};

		return await this.client.executeRequest<UpdatePaymentMethodResponse>(uri, "PUT", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}

	async redactPaymentMethod(paymentMethodId:string, requestOptions?:RequestOptions):Promise<RedactPaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}/redact`;

		return await this.client.executeRequest<RedactPaymentMethodResponse>(uri, "PUT", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers });
	}

	async recacheCvv(paymentMethodId:string, cvv:string, requestOptions?:RequestOptions):Promise<RecachePaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}/recache`;

		const request:RecachePaymentMethodRequest = {
			paymentMethod: {
				creditCard: {
					cvv,
				},
			},
		};

		return await this.client.executeRequest<RecachePaymentMethodResponse>(uri, "PUT", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}
}

class Charge {
	constructor(
		private client:TransactionClient
	) { }

	// Charges a credit card directly from passed in card information
	async chargeCreditCard(creditCardCharge:ChargeCreditCardRequest, requestOptions?:RequestOptions):Promise<ChargeCreditCardResponse> {
		const uri = "/gateways/charge";

		const request = {
			"transaction": creditCardCharge,
		};

		return await this.client.executeRequest<ChargeCreditCardResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}

	// Charges a gateway stored payment method directly from passed in gateway payment method info
	async chargeGatewayPaymentMethod(gatewayPaymentMethodCharge:ChargeGatewayPaymentMethodRequest, requestOptions?:RequestOptions):Promise<ChargeGatewayPaymentMethodResponse> {
		const uri = "/gateways/charge";

		const request = {
			"transaction": gatewayPaymentMethodCharge,
		};

		return await this.client.executeRequest<ChargeGatewayPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}

	// Charges a previously tokenized payment method (either credit card or gateway) from the passed in payment method id
	async chargeTokenizedPaymentMethod(tokenizedPaymentMethodCharge:ChargeTokenizedPaymentMethodRequest, requestOptions?:RequestOptions):Promise<ChargeTokenizedPaymentMethodResponse> {
		const uri = "/gateways/charge";

		const request = {
			"transaction": tokenizedPaymentMethodCharge,
		};

		return await this.client.executeRequest<ChargeTokenizedPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}
}

class Authorize {
	constructor(
		private client:TransactionClient
	) { }

	// Auths a credit card directly from passed in card information
	async authorizeCreditCard(creditCardCharge:AuthorizeCreditCardRequest, requestOptions?:RequestOptions):Promise<AuthorizeCreditCardResponse> {
		const uri = "/gateways/authorize";

		const request = {
			"transaction": creditCardCharge,
		};

		return await this.client.executeRequest<AuthorizeCreditCardResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}

	// Auths a gateway stored payment method directly from passed in gateway payment method info
	async authorizeGatewayPaymentMethod(gatewayPaymentMethodCharge:AuthorizeGatewayPaymentMethodRequest, requestOptions?:RequestOptions):Promise<AuthorizeGatewayPaymentMethodResponse> {
		const uri = "/gateways/authorize";

		const request = {
			"transaction": gatewayPaymentMethodCharge,
		};

		return await this.client.executeRequest<AuthorizeGatewayPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}

	// Auths a previously tokenized payment method (either credit card or gateway) from the passed in payment method id
	async authorizeTokenizedPaymentMethod(tokenizedPaymentMethodCharge:AuthorizeTokenizedPaymentMethodRequest, requestOptions?:RequestOptions):Promise<AuthorizeTokenizedPaymentMethodResponse> {
		const uri = "/gateways/authorize";

		const request = {
			"transaction": tokenizedPaymentMethodCharge,
		};

		return await this.client.executeRequest<AuthorizeTokenizedPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}

}

class Capture {
	constructor(
		private client:TransactionClient
	) { }

	async capture(transactionId:string, capture:CaptureRequest, requestOptions?:RequestOptions):Promise<CaptureResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}/capture`;

		const request = {
			"transaction": capture,
		};

		return await this.client.executeRequest<CaptureResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}
}

class Void {
	constructor(
		private client:TransactionClient
	) { }

	async void(transactionId:string, capture:VoidRequest, requestOptions?:RequestOptions):Promise<VoidResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}/void`;

		const request = {
			"transaction": capture,
		};

		return await this.client.executeRequest<VoidResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}
}

class Refund {
	constructor(
		private client:TransactionClient
	) { }

	async refund(transactionId:string, refund:RefundRequest, requestOptions?:RequestOptions):Promise<RefundResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}/refund`;

		const request = {
			"transaction": refund,
		};

		return await this.client.executeRequest<RefundResponse>(uri, "POST", { entityContainerPropertyName: "transaction", headers: requestOptions?.headers }, request);
	}
}

class HealthCheck {
	constructor(
		private client:TransactionClient
	) { }

	async healthCheck(requestOptions?:RequestOptions):Promise<boolean> {
		const uri = "/api/test";

		const response = await this.client.executeRequest<HealthCheckResponse>(uri, "GET", {
			prefixApiVersion: false,
			isTransactionResponse: false,
			headers: requestOptions?.headers,
		});

		return response.message === "Your client successfully connects with FlexPay!";
	}
}
