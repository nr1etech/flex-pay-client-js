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

	async getTransaction(transactionId:string):Promise<TransactionResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}`;

		return await this.client.executeDirectRequest<TransactionResponse>(uri, "GET", { entityContainerPropertyName: "transaction" });
	}

	async getTransactionByMerchantTransactionId(merchantTransactionId:string):Promise<TransactionResponse> {
		const uri = `/transactions/byMerchantTransactionId/${encodeURIComponent(merchantTransactionId)}`;

		return await this.client.executeDirectRequest<TransactionResponse>(uri, "GET", { entityContainerPropertyName: "transaction" });
	}

	async getTransactionList(pageId:string|null = null, pageSize:number = 20, sortOrder:SortOrder = SortOrder.Ascending):Promise<TransactionListItemResponse[]> {
		const uri = "/transactions";

		pageSize = this.client.constrainPageSize(pageSize);

		const queryParameters = {
			"order": sortOrder.toString(),
			"count": pageSize.toString(),
			"sinceToken": pageId ?? undefined,
		};
		const clientRequestOptions = { listPropertyName: "transactions", entityContainerPropertyName: undefined };

		return await this.client.executeDirectRequest<TransactionListItemResponse[]>(uri, "GET", clientRequestOptions, undefined, queryParameters);
	}
}

class PaymentMethods {
	constructor(
		private client:TransactionClient
	) { }

	async tokenizeCreditCard(creditCardPaymentMethod:TokenizeCreditCardPaymentMethodRequest):Promise<TokenizeCreditCardPaymentMethodResponse> {
		const uri = "/paymentmethods";

		const request = {
			"paymentMethod": creditCardPaymentMethod,
		};

		return await this.client.executeDirectRequest<TokenizeCreditCardPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	async tokenizeGatewayPaymentMethod(tokenizedPaymentMethod:TokenizeGatewayPaymentMethodRequest):Promise<TokenizeGatewayPaymentMethodResponse> {
		const uri = "/paymentmethods";

		const request = {
			"paymentMethod": tokenizedPaymentMethod,
		};

		return await this.client.executeDirectRequest<TokenizeGatewayPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	async getPaymentMethodList(pageId:string|null = null, pageSize:number = 20, sortOrder:SortOrder = SortOrder.Ascending):Promise<PaymentMethodListItem[]> {
		const uri = "/paymentmethods";

		pageSize = this.client.constrainPageSize(pageSize);

		const queryParameters = {
			"order": sortOrder.toString(),
			"count": pageSize.toString(),
			"sinceToken": pageId ?? undefined,
		};
		const clientRequestOptions = { listPropertyName: "paymentMethods", entityContainerPropertyName: "paymentMethod" };

		return await this.client.executeDirectRequest<PaymentMethodListItem[]>(uri, "GET", clientRequestOptions, undefined, queryParameters);
	}

	async getPaymentMethod(paymentMethodId:string):Promise<PaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}`;

		return await this.client.executeDirectRequest<PaymentMethodResponse>(uri, "GET", { entityContainerPropertyName: "paymentMethod" });
	}

	async updatePaymentMethod(paymentMethodId:string, updatePaymentMethodRequest:UpdatePaymentMethodRequest):Promise<UpdatePaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}`;

		const request = {
			"paymentMethod": updatePaymentMethodRequest,
		};

		return await this.client.executeDirectRequest<UpdatePaymentMethodResponse>(uri, "PUT", { entityContainerPropertyName: "transaction" }, request);
	}

	async redactPaymentMethod(paymentMethodId:string):Promise<RedactPaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}/redact`;

		return await this.client.executeDirectRequest<RedactPaymentMethodResponse>(uri, "PUT", { entityContainerPropertyName: "transaction" });
	}

	async recacheCvv(paymentMethodId:string, cvv:string):Promise<RecachePaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}/recache`;

		const request:RecachePaymentMethodRequest = {
			paymentMethod: {
				creditCard: {
					cvv,
				},
			},
		};

		return await this.client.executeDirectRequest<RecachePaymentMethodResponse>(uri, "PUT", { entityContainerPropertyName: "transaction" }, request);
	}
}

class Charge {
	constructor(
		private client:TransactionClient
	) { }

	// Charges a credit card directly from passed in card information
	async chargeCreditCard(creditCardCharge:ChargeCreditCardRequest):Promise<ChargeCreditCardResponse> {
		const uri = "/gateways/charge";

		const request = {
			"transaction": creditCardCharge,
		};

		return await this.client.executeProxyRequest<ChargeCreditCardResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	// Charges a gateway stored payment method directly from passed in gateway payment method info
	async chargeGatewayPaymentMethod(gatewayPaymentMethodCharge:ChargeGatewayPaymentMethodRequest):Promise<ChargeGatewayPaymentMethodResponse> {
		const uri = "/gateways/charge";

		const request = {
			"transaction": gatewayPaymentMethodCharge,
		};

		return await this.client.executeDirectRequest<ChargeGatewayPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	// Charges a previously tokenized payment method (either credit card or gateway) from the passed in payment method id
	async chargeTokenizedPaymentMethod(tokenizedPaymentMethodCharge:ChargeTokenizedPaymentMethodRequest):Promise<ChargeTokenizedPaymentMethodResponse> {
		const uri = "/gateways/charge";

		const request = {
			"transaction": tokenizedPaymentMethodCharge,
		};

		return await this.client.executeDirectRequest<ChargeTokenizedPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}
}

class Authorize {
	constructor(
		private client:TransactionClient
	) { }

	// Auths a credit card directly from passed in card information
	async authorizeCreditCard(creditCardCharge:AuthorizeCreditCardRequest):Promise<AuthorizeCreditCardResponse> {
		const uri = "/gateways/authorize";

		const request = {
			"transaction": creditCardCharge,
		};

		return await this.client.executeProxyRequest<AuthorizeCreditCardResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	// Auths a gateway stored payment method directly from passed in gateway payment method info
	async authorizeGatewayPaymentMethod(gatewayPaymentMethodCharge:AuthorizeGatewayPaymentMethodRequest):Promise<AuthorizeGatewayPaymentMethodResponse> {
		const uri = "/gateways/authorize";

		const request = {
			"transaction": gatewayPaymentMethodCharge,
		};

		return await this.client.executeDirectRequest<AuthorizeGatewayPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	// Auths a previously tokenized payment method (either credit card or gateway) from the passed in payment method id
	async authorizeTokenizedPaymentMethod(tokenizedPaymentMethodCharge:AuthorizeTokenizedPaymentMethodRequest):Promise<AuthorizeTokenizedPaymentMethodResponse> {
		const uri = "/gateways/authorize";

		const request = {
			"transaction": tokenizedPaymentMethodCharge,
		};

		return await this.client.executeDirectRequest<AuthorizeTokenizedPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

}

class Capture {
	constructor(
		private client:TransactionClient
	) { }

	async capture(transactionId:string, capture:CaptureRequest):Promise<CaptureResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}/capture`;

		const request = {
			"transaction": capture,
		};

		return await this.client.executeDirectRequest<CaptureResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}
}

class Void {
	constructor(
		private client:TransactionClient
	) { }

	async void(transactionId:string, capture:VoidRequest):Promise<VoidResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}/void`;

		const request = {
			"transaction": capture,
		};

		return await this.client.executeDirectRequest<VoidResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}
}

class Refund {
	constructor(
		private client:TransactionClient
	) { }

	async refund(transactionId:string, refund:RefundRequest):Promise<RefundResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}/refund`;

		const request = {
			"transaction": refund,
		};

		return await this.client.executeDirectRequest<RefundResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}
}

class HealthCheck {
	constructor(
		private client:TransactionClient
	) { }

	async healthCheck():Promise<boolean> {
		const uri = "/api/test";

		const response = await this.client.executeDirectRequest<HealthCheckResponse>(uri, "GET", {
			prefixApiVersion: false,
			isTransactionResponse: false,
		});

		return response.message === "Your client successfully connects with FlexPay!";
	}
}
