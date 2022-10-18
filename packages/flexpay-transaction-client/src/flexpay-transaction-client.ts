import { TransactionClient, ClientOptions, SortOrder, Transaction, TransactionListItem, CreateCreditCardPaymentMethodRequest, CreateCreditCardPaymentMethodResponse, CreateTokenizedPaymentMethodRequest, PaymentMethodListItem, PaymentMethod, UpdatePaymentMethodRequest, UpdatePaymentMethodResponse, RedactPaymentMethodResponse, RecachePaymentMethodResponse, ChargeCreditCardRequest, ChargeCreditCardResponse, ChargeTokenizedPaymentMethodRequest, ChargeTokenizedPaymentMethodResponse, ChargeGatewayPaymentMethodRequest, ChargeGatewayPaymentMethodResponse, AuthorizeCreditCardRequest, AuthorizeCreditCardResponse, AuthorizeTokenizedPaymentMethodRequest, AuthorizeTokenizedPaymentMethodResponse, AuthorizeGatewayPaymentMethodRequest, AuthorizeGatewayPaymentMethodResponse, CaptureRequest, CaptureResponse, VoidRequest, VoidResponse, RefundFullRequest, RefundFullResponse, RefundPartialRequest, RefundPartialResponse, HealthCheckResponse, CreateTokenizedPaymentMethodResponse } from ".";

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

	public setAuthorizationToken(authorizationToken:string):void {
		this.client.setAuthorizationToken(authorizationToken);
	}
}

class Transactions {
	constructor(
		private client:TransactionClient
	) { }

	async getTransaction(transactionId:string):Promise<Transaction> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}`;

		return await this.client.executeRequest<Transaction>(uri, "GET", { entityContainerPropertyName: "transaction" });
	}

	async getTransactionByMerchantTransactionId(merchantTransactionId:string):Promise<Transaction> {
		const uri = `/transactions/byMerchantTransactionId/${encodeURIComponent(merchantTransactionId)}`;

		return await this.client.executeRequest<Transaction>(uri, "GET", { entityContainerPropertyName: "transaction" });
	}

	async getTransactionList(pageId:string|null = null, pageSize:number = 20, sortOrder:SortOrder = SortOrder.Ascending):Promise<TransactionListItem[]> {
		const uri = "/transactions";

		pageSize = this.client.constrainPageSize(pageSize);

		const queryParameters = {
			"order": sortOrder.toString(),
			"count": pageSize.toString(),
			"sinceToken": pageId ?? undefined,
		};
		const requestOptions = { listPropertyName: "transactions", entityContainerPropertyName: undefined };

		return await this.client.executeRequest<TransactionListItem[]>(uri, "GET", requestOptions, undefined, queryParameters);
	}
}

class PaymentMethods {
	constructor(
		private client:TransactionClient
	) { }

	async createCreditCardPaymentMethod(creditCardPaymentMethod:CreateCreditCardPaymentMethodRequest):Promise<CreateCreditCardPaymentMethodResponse> {
		const uri = "/paymentmethods";

		const request = {
			"paymentMethod": creditCardPaymentMethod,
		};

		return await this.client.executeRequest<CreateCreditCardPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	async createdTokenizedPaymentMethod(tokenizedPaymentMethod:CreateTokenizedPaymentMethodRequest):Promise<CreateTokenizedPaymentMethodResponse> {
		const uri = "/paymentmethods";

		const request = {
			"paymentMethod": tokenizedPaymentMethod,
		};

		return await this.client.executeRequest<CreateTokenizedPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	async getPaymentMethodList(pageId:string|null = null, pageSize:number = 20, sortOrder:SortOrder = SortOrder.Ascending):Promise<PaymentMethodListItem[]> {
		const uri = "/paymentmethods";

		pageSize = this.client.constrainPageSize(pageSize);

		const queryParameters = {
			"order": sortOrder.toString(),
			"count": pageSize.toString(),
			"sinceToken": pageId ?? undefined,
		};
		const requestOptions = { listPropertyName: "paymentMethods", entityContainerPropertyName: "paymentMethod" };
		// FIXME -- the documentation does not specify these property names. It was determined by querying the endpoint

		return await this.client.executeRequest<PaymentMethodListItem[]>(uri, "GET", requestOptions, undefined, queryParameters);
	}

	async getPaymentMethod(paymentMethodId:string):Promise<PaymentMethod> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}`;

		return await this.client.executeRequest<PaymentMethod>(uri, "GET", { entityContainerPropertyName: "paymentMethod" });
	}

	async updatePaymentMethod(paymentMethodId:string, updatePaymentMethodRequest:UpdatePaymentMethodRequest):Promise<UpdatePaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}`;

		const request = {
			"paymentMethod": updatePaymentMethodRequest,
		};

		return await this.client.executeRequest<UpdatePaymentMethodResponse>(uri, "PUT", { entityContainerPropertyName: "transaction" }, request);
	}

	async redactPaymentMethod(paymentMethodId:string):Promise<RedactPaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}/redact`;

		return await this.client.executeRequest<RedactPaymentMethodResponse>(uri, "PUT", { entityContainerPropertyName: "transaction" });
	}

	async recacheCvv(paymentMethodId:string, cvv:string|null):Promise<RecachePaymentMethodResponse> {
		const uri = `/paymentmethods/${encodeURIComponent(paymentMethodId)}/recache`;

		const request = {
			"paymentMethod": {
				"cvv": cvv,
			},
		};

		return await this.client.executeRequest<RecachePaymentMethodResponse>(uri, "PUT", { entityContainerPropertyName: "transaction" }, request);
	}
}

class Charge {
	constructor(
		private client:TransactionClient
	) { }

	async chargeCreditCard(creditCardCharge:ChargeCreditCardRequest):Promise<ChargeCreditCardResponse> {
		const uri = "/gateways/charge";

		const request = {
			"transaction": creditCardCharge,
		};

		return await this.client.executeRequest<ChargeCreditCardResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	async chargeTokenizedPaymentMethod(tokenizedPaymentMethodCharge:ChargeTokenizedPaymentMethodRequest):Promise<ChargeTokenizedPaymentMethodResponse> {
		const uri = "/gateways/charge";

		const request = {
			"transaction": tokenizedPaymentMethodCharge,
		};

		return await this.client.executeRequest<ChargeTokenizedPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	async chargeGatewayPaymentMethod(gatewayPaymentMethodCharge:ChargeGatewayPaymentMethodRequest):Promise<ChargeGatewayPaymentMethodResponse> {
		const uri = "/gateways/charge";

		const request = {
			"transaction": gatewayPaymentMethodCharge,
		};

		return await this.client.executeRequest<ChargeGatewayPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}
}

class Authorize {
	constructor(
		private client:TransactionClient
	) { }

	async authorizeCreditCard(creditCardCharge:AuthorizeCreditCardRequest):Promise<AuthorizeCreditCardResponse> {
		const uri = "/gateways/authorize";

		const request = {
			"transaction": creditCardCharge,
		};

		return await this.client.executeRequest<AuthorizeCreditCardResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	async authorizeTokenizedPaymentMethod(tokenizedPaymentMethodCharge:AuthorizeTokenizedPaymentMethodRequest):Promise<AuthorizeTokenizedPaymentMethodResponse> {
		const uri = "/gateways/authorize";

		const request = {
			"transaction": tokenizedPaymentMethodCharge,
		};

		return await this.client.executeRequest<AuthorizeTokenizedPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	async authorizeGatewayPaymentMethod(gatewayPaymentMethodCharge:AuthorizeGatewayPaymentMethodRequest):Promise<AuthorizeGatewayPaymentMethodResponse> {
		const uri = "/gateways/authorize";

		const request = {
			"transaction": gatewayPaymentMethodCharge,
		};

		return await this.client.executeRequest<AuthorizeGatewayPaymentMethodResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
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

		return await this.client.executeRequest<CaptureResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
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

		return await this.client.executeRequest<VoidResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}
}

class Refund {
	constructor(
		private client:TransactionClient
	) { }

	async refundFull(transactionId:string, refund:RefundFullRequest):Promise<RefundFullResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}/refund`;

		const request = {
			"transaction": refund,
		};

		return await this.client.executeRequest<RefundFullResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}

	async refundPartial(transactionId:string, refund:RefundPartialRequest):Promise<RefundPartialResponse> {
		const uri = `/transactions/${encodeURIComponent(transactionId)}/refund`;

		const request = {
			"transaction": refund,
		};

		return await this.client.executeRequest<RefundPartialResponse>(uri, "POST", { entityContainerPropertyName: "transaction" }, request);
	}
}

class HealthCheck {
	constructor(
		private client:TransactionClient
	) { }

	async healthCheck():Promise<boolean> {
		const uri = "/api/test";

		const response = await this.client.executeRequest<HealthCheckResponse>(uri, "GET", {
			prefixApiVersion: false,
			isTransactionResponse: false,
		});

		return response.message === "Your client successfully connects with FlexPay!";
	}
}
