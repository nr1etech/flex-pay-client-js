import { FlexPayTransactionClient, sandbox, PaymentModel, ChargeCreditCardRequest, ResponseError, SortOrder, ResponseCode, CreateCreditCardPaymentMethodRequest, CreateTokenizedPaymentMethodRequest, AuthorizeCreditCardRequest, TransactionStatus, PaymentMethodType, StorageState, AuthorizeTokenizedPaymentMethodRequest, VoidRequest, AvsResponseCode, CvvResponseCode, ChargeGatewayPaymentMethodRequest, RefundRequest, AuthorizationError, ChargeTokenizedPaymentMethodRequest, ChargeCreditCardResponse, ChargeTokenizedPaymentMethodResponse, AddressResponse, GatewayPaymentMethodResponse, VoidResponse, RefundResponse } from "../../src";
import { consoleJson, EmptyObjectBuilder, generateUniqueMerchantTransactionId, sleep } from "../test-helper";
jest.setTimeout(300000);	// 5 minutes

let GATEWAY_TOKEN:string;
let AUTHORIZATION_TOKEN:string;
let client:FlexPayTransactionClient;

beforeAll(() => {
	consoleJson(undefined);	// Just calling this so TS doesn't complain about the import

	GATEWAY_TOKEN = process.env["X_FP_GATEWAY_TOKEN"] as string;
	AUTHORIZATION_TOKEN = process.env["X_FP_AUTH_TOKEN"] as string;
	client = new FlexPayTransactionClient({
		authorizationToken: AUTHORIZATION_TOKEN,
		debugOutput: true,
	});
});

beforeEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

function getBasicCreditCardPaymentMethodRequest<T>(requestOverride?:Record<string, unknown>|undefined, creditCardOverride?:Record<string, unknown>|undefined):T {
	const paymentMethod:unknown = {
		customerId: "basic test customer",
		creditCard: {
			creditCardNumber: sandbox.creditCards.visa.creditCardNumber,
			expiryMonth: sandbox.creditCards.visa.expiryMonth,
			expiryYear: sandbox.creditCards.visa.expiryYear,
			cvv: sandbox.creditCards.visa.cvv,
			firstName: "John",
			lastName: "Doe",
			fullName: null,
			address1: "",
			address2: null,
			postalCode: "",
			city: "",
			state: "",
			country: "",
			email: null,
			phoneNumber: null,
			...creditCardOverride,
		},
		...requestOverride,
	};

	return paymentMethod as T;
};

function getBasicTokenizedPaymentMethodRequest<T>(requestOverride?:Record<string, unknown>|undefined, paymentMethodOverride?:Record<string, unknown>|undefined) {
	return {
		customerId: "integration test customer 2",
		gatewayPaymentMethod: {
			gatewayPaymentMethodId: "GWPMID-TEST1",
			merchantAccountReferenceId: "TEST-GATEWAY",
			firstSixDigits: sandbox.creditCards.visa.creditCardNumber.slice(0, 6),
			lastFourDigits: sandbox.creditCards.visa.creditCardNumber.slice(-4),
			expiryMonth: sandbox.creditCards.visa.expiryMonth,
			expiryYear: sandbox.creditCards.visa.expiryYear,
			firstName: "John",
			lastName: "Doe",
			fullName: null,
			address1: "",
			address2: null,
			postalCode: "",
			city: "",
			state: "",
			country: "",
			email: null,
			phoneNumber: null,
			...paymentMethodOverride
		},
		...requestOverride,
	} as T;
}


describe("Client", () => {
	it("should show unauthorized on an invalid auth token", async () => {
		const tempClient = new FlexPayTransactionClient({
			authorizationToken: "INVALIDAUTHTOKEN",
		});

		try {
			await tempClient.paymentMethods.getPaymentMethod("DONTNEEDANYTHING");
			expect("Should have thown an excpetion").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(AuthorizationError);
		}
	});

	it("should show unauthorized on a blank auth token", async () => {
		const tempClient = new FlexPayTransactionClient({
			authorizationToken: "",
		});

		try {
			await tempClient.paymentMethods.getPaymentMethod("DONTNEEDANYTHING");
			expect("Should have thown an excpetion").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(AuthorizationError);
		}
	});

	it("should fail to instantiate if an invalid URL is given", async () => {
		try {
			new FlexPayTransactionClient({
				authorizationToken: "ABCD",
				baseUrl: "ftp://thisisnt.the.url",
			});
			expect("Should have thrown an exception").toBeFalsy();
		} catch (ex) {

		}
	});

	it("should report healthy", async () => {
		const isHealthy = await client.healthCheck.healthCheck();
		expect(isHealthy).toEqual(true);
	})
});

describe("Payment Methods", () => {
	it("should create a credit card", async () => {
		const response = await client.paymentMethods.createCreditCardPaymentMethod(
			getBasicCreditCardPaymentMethodRequest<CreateCreditCardPaymentMethodRequest>({
				customerId: "integration test customer 1",
			}),
		);

		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);
	});

	it("should fail on invalid card data", async () => {
		const response = await client.paymentMethods.createCreditCardPaymentMethod(
			getBasicCreditCardPaymentMethodRequest<CreateCreditCardPaymentMethodRequest>({
				customerId: "integration test customer 2",
			}, {
				creditCardNumber: "123456",
			}
		));
		expect(response.responseCode, "Credit Card Payment Method: Card number too short").toEqual(ResponseCode.ApiInvalidCreditCardNumberLength);
	});

	it("should create a tokenized payment method", async () => {
		const response = await client.paymentMethods.createdTokenizedPaymentMethod(
			getBasicTokenizedPaymentMethodRequest({
				customerId: "integration test customer 2",
			})
		);
		expect(response.responseCode, "Tokenized Payment Method approved").toEqual(ResponseCode.Approved);
	});

	it("should fail on invalid tokenized payment method data", async () => {
		const response = await client.paymentMethods.createdTokenizedPaymentMethod(
			getBasicTokenizedPaymentMethodRequest({
				customerId: "integration test customer 3",
			}, {
				firstName: "",
				lastName: "",
				fullName: null,
			})
		);
		expect(response.responseCode, "Tokenized Payment Method missing name fields").toEqual(ResponseCode.ApiFullnameOrFirstLastRequired);
	});

	it("should a list of payment methods", async () => {
		let paymentMethods = await client.paymentMethods.getPaymentMethodList(null, 1, SortOrder.Descending);
		expect(paymentMethods.length, "Get a list of payment methods").toBeGreaterThanOrEqual(1);

		paymentMethods = await client.paymentMethods.getPaymentMethodList(paymentMethods[paymentMethods.length - 1].paymentMethodId, 1, SortOrder.Descending);
		expect(paymentMethods.length, "Get the next page of payment methods").toBeGreaterThanOrEqual(1);
	});

	it("should get a payment method", async () => {
		const response = await client.paymentMethods.createCreditCardPaymentMethod(getBasicCreditCardPaymentMethodRequest());
		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const paymentMethod = await client.paymentMethods.getPaymentMethod(response.paymentMethod.paymentMethodId);
		expect(paymentMethod, "Loaded payment method should match").toMatchObject(response.paymentMethod);

	});

	it.skip("should update a payment method", async () => {
		const response = await client.paymentMethods.createCreditCardPaymentMethod(getBasicCreditCardPaymentMethodRequest(undefined, {
			firstName: "John",
			email: "jdoe@example.com",
		}));
		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const propertiesToUpdate = {
			firstName: "Jane",
			email: null,
		};

		const updateResponse = await client.paymentMethods.updatePaymentMethod(response.paymentMethod.paymentMethodId, propertiesToUpdate);
		expect(updateResponse.responseCode, "Update payment method should be approved").toEqual(ResponseCode.Approved);

		expect(updateResponse, "Update Payment response object should match the expected results").toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: expect.objectContaining(propertiesToUpdate),
		});
	});

	it("should fail to update a payment method with update data", async () => {
		const response = await client.paymentMethods.createCreditCardPaymentMethod(getBasicCreditCardPaymentMethodRequest());
		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		try {
			await client.paymentMethods.updatePaymentMethod(response.paymentMethod.paymentMethodId, { });
			expect("Update payment method should should have thrown").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(ResponseError);
			expect((ex as Error).message).toContain("no editable field");
		}
	});

	it("should fail to update a payment method with invalid data", async () => {
		const response = await client.paymentMethods.createCreditCardPaymentMethod(getBasicCreditCardPaymentMethodRequest());
		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		try {
			await client.paymentMethods.updatePaymentMethod(response.paymentMethod.paymentMethodId, {
				lastName: "",
			});
			expect("Update payment method should should have thrown").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(ResponseError);
			expect((ex as Error).message).toContain("no editable field");
		}
	});

	it.skip("should redact a payment method", async () => {
		const response = await client.paymentMethods.createCreditCardPaymentMethod(getBasicCreditCardPaymentMethodRequest());
		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const redactResponse = await client.paymentMethods.redactPaymentMethod(response.paymentMethod.paymentMethodId);
		expect(redactResponse.responseCode, "Payment method Redact command should be approved").toEqual(ResponseCode.Approved);

		const getResponse = await client.paymentMethods.getPaymentMethod(response.paymentMethod.paymentMethodId);
		expect(getResponse.creditCardNumber, "Payment method credit card number should be removed").toEqual("");
	});

	it.skip.each([
		["Made up CVV", "999"],
		["Sandbox CVV", sandbox.creditCards.visa.cvv],
		["Null CVV", null]
	])("should recache the CVV value (%s: %s)", async (testName:string, cvv:string|null) => {
		// const response = await client.paymentMethods.createCreditCardPaymentMethod(getBasicCreditCardPaymentMethodRequest());
		// expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		//const paymentMethodId = response.paymentMethod.paymentMethodId;
		const paymentMethodId = "UJ3XO2KT4FZU3PPYAGB7FF6CVU";

		const recacheResponse = await client.paymentMethods.recacheCvv(paymentMethodId, cvv);
		expect(recacheResponse.responseCode).toEqual(ResponseCode.Approved);
	});
});

describe("Transactions", () => {
	it("should load pages of transactions", async () => {
		// Get list - set list size and order
		let transactions = await client.transactions.getTransactionList(null, 10, SortOrder.Descending);
		expect(transactions.length, "Should have gotten a list back").toBeGreaterThanOrEqual(1);

		if (transactions.length > 0) {
			// Get the next page of transactions
			transactions = await client.transactions.getTransactionList(transactions[transactions.length - 1].transactionId, 10, SortOrder.Descending);
			expect(transactions.length, "Should have gotten the next page").toBeGreaterThanOrEqual(0);
		} else {
			expect("Insufficient transactions to test", "Could not complete transaction API tests because too few transactions were returned from the getTransactionList call").toBeFalsy();
		}
	});

	it("should load a transaction by transactionId and by merchantTransactionId", async () => {
		// Note: the getTransaction and getTransactionByMerchantTransactionId tests are combined because loading a
		//  list of transactions does not provide the merchantTransactionId.

		// Get list
		const transactions = await client.transactions.getTransactionList(null, 1);
		expect(transactions.length, "Should have gotten a list back").toBeGreaterThanOrEqual(1);

		// Load by transactionId
		const transaction = await client.transactions.getTransaction(transactions[0].transactionId);
		expect(transaction.transactionId, "Should have loaded the transaction").toEqual(transactions[0].transactionId);

		// Load by merchantTransactionId
		const transactionByM = await client.transactions.getTransactionByMerchantTransactionId(transaction.merchantTransactionId);
		expect(transactionByM.merchantTransactionId, "Should have loaded the transaction by merchantTransactionId").toEqual(transaction.merchantTransactionId);
	});
});


function getBasicChargeRequest(override?:Record<string, unknown>):ChargeCreditCardRequest {
	const request:ChargeCreditCardRequest = {
		amount: 1000,	// $10.00
		currencyCode: "USD",
		customerId: "test",
		customerIp: "196.168.1.123",
		dateFirstAttempt: new Date(),
		description: "Test charge",
		gatewayToken: GATEWAY_TOKEN,
		disableCustomerRecovery: false,
		merchantTransactionId: generateUniqueMerchantTransactionId(),
		orderId: "01234",
		paymentMethod: {
			address1: "123 A St",
			address2: null,
			city: "Townsville",
			state: "UT",
			postalCode: "84062",
			country: "US",

			creditCardNumber: sandbox.creditCards.visa.creditCardNumber,
			cvv: sandbox.creditCards.visa.cvv,
			expiryMonth: sandbox.creditCards.visa.expiryMonth,
			expiryYear: sandbox.creditCards.visa.expiryYear,
			phoneNumber: "8015551234",
			email: "johndoe@example.com",
			firstName: "John",
			lastName: "Doe",
			fullName: null,
			merchantAccountReferenceId: null,
		},
		customVariable1: null,
		customVariable2: null,
		customVariable3: null,
		customVariable4: null,
		customVariable5: null,
		paymentModel: PaymentModel.Subscription,
		paymentPlan: {
			billingCycle: 1,
			billingPlan: null,
			category: null,
			sku: null
		},
		shippingAddress: {
			address1: "123 A St",
			address2: null,
			city: "Townsville",
			state: "UT",
			postalCode: "84062",
			country: "US",
		},
		referenceData: null,
		References: {
			PreviousTransaction: {
				gatewayCode: null,
				gatewayMesage: null,
				merchantAccountReferenceId: null,
				transactionDate: null
			}
		},
		retainOnSuccess: false,
		retryCount: 1,
		...override,
	};

	return request;
}

describe("Charge", () => {
	it("should approve a credit card", async () => {
		const chargeRequest = getBasicChargeRequest();
		const chargeResponse = await client.charge.chargeCreditCard(chargeRequest);

		let expectedResponse:any = EmptyObjectBuilder.chargeResponse();
		expectedResponse = {
			...expectedResponse,
			currencyCode: chargeRequest.currencyCode,
			customerId: chargeRequest.customerId,
			customerIp: chargeRequest.customerIp,
			description: chargeRequest.description,
			merchantTransactionId: chargeRequest.merchantTransactionId,
			orderId: chargeRequest.orderId,
			retryCount: chargeRequest.retryCount,
			shippingAddress: chargeRequest.shippingAddress,

			message: "Approved.",
			responseCode: ResponseCode.Approved,
			transactionStatus: TransactionStatus.Approved,
			response: {
				...expectedResponse.response,
				cvvCode: CvvResponseCode.Match,
				cvvMessage: "Approved",
				avsCode: AvsResponseCode.AvsNotSupported,
				avsMessage: "AVS not supported.",
			},
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...chargeRequest.paymentMethod,
				cardType: sandbox.creditCards.visa.cardType,
				creditCardNumber: expect.stringContaining(chargeRequest.paymentMethod.creditCardNumber.slice(0, 6)),
				cvv: "***",
				customerId: chargeRequest.customerId,
				fullName: expect.stringMatching(`${chargeRequest.paymentMethod.firstName} ${chargeRequest.paymentMethod.lastName}`),
				firstSixDigits: expect.stringMatching(chargeRequest.paymentMethod.creditCardNumber.slice(0, 6)),
				lastFourDigits: expect.stringMatching(chargeRequest.paymentMethod.creditCardNumber.slice(-4)),
				paymentMethodType: PaymentMethodType.CreditCard,
				storageState: StorageState.Cached,
			}
		};
		delete expectedResponse.paymentMethod.merchantAccountReferenceId;

		expect(chargeResponse, "Credit Card Charge response should match expected values").toEqual(expectedResponse);
	});

	it("should fail if a malformed payload is sent", async () => {
		const chargeRequest = getBasicChargeRequest({ dateFirstAttempt: "bad value" });

		try {
			await client.charge.chargeCreditCard(chargeRequest)
		} catch (ex) {
			expect(ex, "Should have thrown a ResponseError").toBeInstanceOf(ResponseError);
		}
	});

	it("should decline on invalid data", async () => {
		const chargeRequest = getBasicChargeRequest({
			paymentMethod: {
				...getBasicChargeRequest().paymentMethod,
				cvv: sandbox.cvv.mismatch.cvv
			}
		});
		const chargeResponse = await client.charge.chargeCreditCard(chargeRequest);

		let expectedResponse:any = EmptyObjectBuilder.chargeResponse();
		expectedResponse = {
			...expectedResponse,
			currencyCode: chargeRequest.currencyCode,
			customerId: chargeRequest.customerId,
			customerIp: chargeRequest.customerIp,
			description: chargeRequest.description,
			merchantTransactionId: chargeRequest.merchantTransactionId,
			orderId: chargeRequest.orderId,
			retryCount: chargeRequest.retryCount,
			shippingAddress: chargeRequest.shippingAddress,

			message: expect.stringContaining("not matched"),
			responseCode: sandbox.cvv.mismatch.responseCode,
			transactionStatus: TransactionStatus.Declined,
			response: {
				...expectedResponse.response,
				cvvCode: sandbox.cvv.mismatch.cvvResponseCode,
				cvvMessage: expect.stringContaining("does not match"),
				avsCode: expect.any(String),
				avsMessage: expect.any(String),
			},
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...chargeRequest.paymentMethod,
				cardType: sandbox.creditCards.visa.cardType,
				creditCardNumber: expect.stringContaining(chargeRequest.paymentMethod.creditCardNumber.slice(0, 6)),
				cvv: "***",
				customerId: chargeRequest.customerId,
				fullName: expect.stringMatching(`${chargeRequest.paymentMethod.firstName} ${chargeRequest.paymentMethod.lastName}`),
				firstSixDigits: expect.stringMatching(chargeRequest.paymentMethod.creditCardNumber.slice(0, 6)),
				lastFourDigits: expect.stringMatching(chargeRequest.paymentMethod.creditCardNumber.slice(-4)),
				paymentMethodType: PaymentMethodType.CreditCard,
				storageState: StorageState.Cached,
			}
		};
		delete expectedResponse.paymentMethod.merchantAccountReferenceId;

		expect(chargeResponse, "Credit Card Charge response should match expected values").toEqual(expectedResponse);
	});

	it.skip("should retain the payment info in the vault", async () => {
		const chargeRequest = getBasicChargeRequest({
			retainOnSuccess: true,
		});
		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction, "Credit Card Charge should be created with retained payment method").toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: expect.objectContaining({
				paymentMethodId: expect.stringMatching(/[A-Z0-9]+/),
			}),
		});

		if (transaction.paymentMethod.paymentMethodId) {
			await sleep(15);
			// Load the payment method so we can verify it exists
			try {
				const retainedPaymentMethod = await client.paymentMethods.getPaymentMethod(transaction.paymentMethod.paymentMethodId);
				expect(retainedPaymentMethod.paymentMethodId, "Should have loaded the payment method").toEqual(transaction.paymentMethod.paymentMethodId);
			} catch (ex) {
				expect(ex, "Should not have thrown when getting the retained payment method").toBeFalsy();
			}
		} else {
			expect("Should have had a paymentMethodId in the response but did not").toBeFalsy();
		}
	});

	it("should charge a stored payment method", async () => {
		const paymentMethod = await client.paymentMethods.createCreditCardPaymentMethod(getBasicCreditCardPaymentMethodRequest<CreateCreditCardPaymentMethodRequest>({
			customerId: "CUSTOMERWITHSTOREDPAYMENTMETHOD"
		}));
		expect(paymentMethod).toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: {
				paymentMethodId: expect.stringMatching(/[A-Z0-9]+/),
			},
		});

		const paymentMethodId = paymentMethod.paymentMethod.paymentMethodId;

		const chargeRequest:ChargeTokenizedPaymentMethodRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O1111",
			description: null,
			customerId: paymentMethod.customerId,
			currencyCode: "USD",
			amount: 1000,
			paymentMethodId: paymentMethodId,
			customerIp: null,
			shippingAddress: null,
			gatewayToken: GATEWAY_TOKEN,
			paymentPlan: null,
			retryCount: 1,
			dateFirstAttempt: null,
			referenceData: null,
			disableCustomerRecovery: false,
			customVariable1: null,
			customVariable2: null,
			customVariable3: null,
			customVariable4: null,
			customVariable5: null,
			References: null,
		};

		const chargeResponse = await client.charge.chargeTokenizedPaymentMethod(chargeRequest);

		let expectedResponse = EmptyObjectBuilder.chargeResponse() as unknown as ChargeTokenizedPaymentMethodResponse;
		expectedResponse = {
			...expectedResponse,
			currencyCode: chargeRequest.currencyCode,
			customerId: chargeRequest.customerId!,
			customerIp: chargeRequest.customerIp!,
			description: chargeRequest.description!,
			merchantTransactionId: chargeRequest.merchantTransactionId,
			orderId: chargeRequest.orderId,
			retryCount: chargeRequest.retryCount,
			shippingAddress: (chargeRequest.shippingAddress as AddressResponse) ?? {
				address1: null,
				address2: null,
				city: null,
				state: null,
				postalCode: null,
				country: null,
			},
			message: "Approved.",
			responseCode: ResponseCode.Approved,
			transactionStatus: TransactionStatus.Approved,
			response: {
				...expectedResponse.response,
				cvvCode: CvvResponseCode.Match,
				cvvMessage: "Approved",
				avsCode: AvsResponseCode.AvsNotSupported,
				avsMessage: "AVS not supported.",
			},
			paymentMethod: {
				...expectedResponse.paymentMethod,
				address1: paymentMethod.paymentMethod.address1,
				address2: paymentMethod.paymentMethod.address2,
				city: paymentMethod.paymentMethod.city,
				country: paymentMethod.paymentMethod.country,
				state: paymentMethod.paymentMethod.state,
				postalCode: paymentMethod.paymentMethod.postalCode,
				cardType: sandbox.creditCards.visa.cardType,
				creditCardNumber: expect.any(String),
				expiryMonth: paymentMethod.paymentMethod.expiryMonth,
				expiryYear: paymentMethod.paymentMethod.expiryYear,
				cvv: "",
				customerId: chargeRequest.customerId!,
				firstName: paymentMethod.paymentMethod.firstName,
				lastName: paymentMethod.paymentMethod.lastName,
				fullName: expect.any(String),
				firstSixDigits: expect.any(String),
				lastFourDigits: expect.any(String),
				paymentMethodType: PaymentMethodType.GatewayPaymentMethodId,
				storageState: StorageState.Cached,
			},
		};

		expect(chargeResponse, "Tokenized Payment Method response should match expected values").toEqual(expectedResponse);
	});

	it.skip("should fail to charge a non-existent tokenized payment method", async () => {
		const transaction = await client.charge.chargeTokenizedPaymentMethod({
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O1111",
			description: null,
			customerId: "test customer 45342",
			currencyCode: "USD",
			amount: 1000,
			paymentMethodId: "TOTALLYMADEUP",
			customerIp: null,
			shippingAddress: null,
			gatewayToken: GATEWAY_TOKEN,
			paymentPlan: null,
			retryCount: 1,
			dateFirstAttempt: null,
			referenceData: null,
			disableCustomerRecovery: false,
			customVariable1: null,
			customVariable2: null,
			customVariable3: null,
			customVariable4: null,
			customVariable5: null,
			References: null
		});
		expect(transaction, "Tokenized Payment Method Charge should fail because the paymentMethodId was made up").toMatchObject({
			responseCode: ResponseCode.ApiInvalidPaymentMethod,
		});
	});

	it("should charge a gateway payment method", async () => {
		const gatewayPaymentMethodRequest = getBasicTokenizedPaymentMethodRequest<CreateTokenizedPaymentMethodRequest>();
		const paymentMethod = await client.paymentMethods.createdTokenizedPaymentMethod(gatewayPaymentMethodRequest);
		expect(paymentMethod).toMatchObject({
			responseCode: ResponseCode.Approved,
		});

		const chargeRequest:ChargeGatewayPaymentMethodRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O1111",
			customerId: "test customer 45342",
			currencyCode: "USD",
			amount: 1000,
			paymentMethod: {
				gatewayPaymentMethodId: paymentMethod.paymentMethod.gatewayPaymentMethodId,
				merchantAccountReferenceId: paymentMethod.paymentMethod.merchantAccountReferenceId,
				firstName: gatewayPaymentMethodRequest.gatewayPaymentMethod.firstName,
				lastName: gatewayPaymentMethodRequest.gatewayPaymentMethod.lastName,
				postalCode: gatewayPaymentMethodRequest.gatewayPaymentMethod.postalCode,
				city: gatewayPaymentMethodRequest.gatewayPaymentMethod.city,
				state: gatewayPaymentMethodRequest.gatewayPaymentMethod.state,
			},
			gatewayToken: GATEWAY_TOKEN,
			retryCount: 1,
			paymentModel: PaymentModel.OneTime,
		};

		const chargeResponse = await client.charge.chargeGatewayPaymentMethod(chargeRequest);

		let expectedResponse:any = EmptyObjectBuilder.chargeResponse();
		expectedResponse = {
			...expectedResponse,
			currencyCode: chargeRequest.currencyCode,
			customerId: chargeRequest.customerId,
			merchantTransactionId: chargeRequest.merchantTransactionId,
			orderId: chargeRequest.orderId,
			retryCount: chargeRequest.retryCount,
			message: "Approved.",
			responseCode: ResponseCode.Approved,
			transactionStatus: TransactionStatus.Approved,
			response: {
				...expectedResponse.response,
				cvvCode: CvvResponseCode.Match,
				cvvMessage: "Approved",
				avsCode: AvsResponseCode.AvsNotSupported,
				avsMessage: "AVS not supported.",
			},
			paymentMethod: {
				...expectedResponse.paymentMethod,
				gatewayPaymentMethodId: paymentMethod.paymentMethod.gatewayPaymentMethodId,
				merchantAccountReferenceId: paymentMethod.paymentMethod.merchantAccountReferenceId,
				creditCardNumber: expect.any(String),
				cvv: "",
				customerId: chargeRequest.customerId,

				firstName: paymentMethod.paymentMethod.firstName,
				lastName: paymentMethod.paymentMethod.lastName,

				fullName: expect.any(String),
				firstSixDigits: expect.any(String),
				lastFourDigits: expect.any(String),
				paymentMethodType: PaymentMethodType.GatewayPaymentMethodId,
				storageState: StorageState.Cached,

				city: paymentMethod.paymentMethod.city,
				state: paymentMethod.paymentMethod.state,
				postalCode: paymentMethod.paymentMethod.postalCode,
			}
		};

		expect(chargeResponse, "Gateway Payment Method response should match expected values").toEqual(expectedResponse);
	});

});

function getBasicAuthRequest(override?:Record<string, unknown>):AuthorizeCreditCardRequest {
	const request:AuthorizeCreditCardRequest = {
		amount: 1000,	// $10.00
		currencyCode: "USD",
		customerId: "test",
		customerIp: "196.168.1.123",
		dateFirstAttempt: new Date(),
		description: "Test charge",
		gatewayToken: GATEWAY_TOKEN,
		disableCustomerRecovery: false,
		merchantTransactionId: generateUniqueMerchantTransactionId(),
		orderId: "01234",
		paymentMethod: {
			address1: "123 A St",
			address2: null,
			city: "Townsville",
			state: "UT",
			postalCode: "84062",
			country: "US",

			creditCardNumber: sandbox.creditCards.visa.creditCardNumber,
			cvv: sandbox.creditCards.visa.cvv,
			expiryMonth: sandbox.creditCards.visa.expiryMonth,
			expiryYear: sandbox.creditCards.visa.expiryYear,
			phoneNumber: "8015551234",
			email: "johndoe@example.com",
			firstName: "John",
			lastName: "Doe",
			fullName: null,
			merchantAccountReferenceId: null,
		},
		customVariable1: null,
		customVariable2: null,
		customVariable3: null,
		customVariable4: null,
		customVariable5: null,
		paymentModel: PaymentModel.Subscription,
		paymentPlan: {
			billingCycle: null,
			billingPlan: null,
			category: null,
			sku: null
		},
		shippingAddress: {
			address1: "123 A St",
			address2: null,
			city: "Townsville",
			state: "UT",
			postalCode: "84062",
			country: "US",
		},
		referenceData: null,
		References: {
			PreviousTransaction: {
				gatewayCode: null,
				gatewayMesage: null,
				merchantAccountReferenceId: null,
				transactionDate: null
			}
		},
		retainOnSuccess: false,
		retryCount: 1,
		...override,
	};

	return request;
}

describe("Authorize", () => {
	it("should approve a credit card", async () => {
		const transaction = await client.authorize.authorizeCreditCard(getBasicAuthRequest());
		expect(transaction.responseCode, "Credit Card Auth should be created").toEqual(ResponseCode.Approved);

		await sleep(15);	// Wait to see if the transaction will be available. In manual tests the wait time has been highly variable (2 ~ 10 seconds).

		// Load the transaction so we can verify it exists
		try {
			const reloadedTransaction = await client.transactions.getTransaction(transaction.transactionId);
			expect(reloadedTransaction.transactionId, "Should have loaded the transaction").toEqual(transaction.transactionId);
		} catch (ex) {
			expect(ex, "Should not have thrown when getting the Auth transaction").toBeFalsy();
		}
	});

	it("should fail if a malformed payload is sent", async () => {
		const request = getBasicAuthRequest({ dateFirstAttempt: "bad value" });

		try {
			await client.authorize.authorizeCreditCard(request)
		} catch (ex) {
			expect(ex, "Should have thrown a ResponseError").toBeInstanceOf(ResponseError);
		}
	});

	it.skip("should retain the payment info in the vault", async () => {
		const request = getBasicAuthRequest({
			retainOnSuccess: true,
		});
		const transaction = await client.authorize.authorizeCreditCard(request);
		expect(transaction, "Credit Card Auth should be created with retained payment method").toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: expect.objectContaining({
				paymentMethodId: expect.stringMatching(/[A-Z0-9]+/),
			}),
		});

		if (transaction.paymentMethod.paymentMethodId) {
			// Load the payment method so we can verify it exists
			try {
				const retainedPaymentMethod = await client.paymentMethods.getPaymentMethod(transaction.paymentMethod.paymentMethodId);
				expect(retainedPaymentMethod.paymentMethodId, "Should have loaded the payment method").toEqual(transaction.paymentMethod.paymentMethodId);
			} catch (ex) {
				expect(ex, "Should not have thrown when getting the retained payment method").toBeFalsy();
			}
		} else {
			expect("Should have had a paymentMethodId in the response but did not").toBeFalsy();
		}
	});

	it.skip("should auth a stored payment method", async () => {
		const paymentMethod = await client.paymentMethods.createCreditCardPaymentMethod(getBasicCreditCardPaymentMethodRequest());
		expect(paymentMethod).toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: {
				paymentMethodId: expect.stringMatching(/[A-Z0-9]+/),
			},
		});

		const transaction = await client.authorize.authorizeTokenizedPaymentMethod({
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O1111",
			description: null,
			customerId: "test customer 45342",
			currencyCode: "USD",
			amount: 1000,
			paymentMethodId: paymentMethod.paymentMethod.paymentMethodId,
			customerIp: null,
			shippingAddress: null,
			gatewayToken: GATEWAY_TOKEN,
			paymentPlan: null,
			retryCount: 1,
			dateFirstAttempt: null,
			referenceData: null,
			disableCustomerRecovery: false,
			customVariable1: null,
			customVariable2: null,
			customVariable3: null,
			customVariable4: null,
			customVariable5: null,
			References: null
		});
		expect(transaction, "Tokenized Payment Method Auth should be created").toMatchObject({
			responseCode: ResponseCode.Approved,
		});
	});

	it.skip("should fail to auth a non-existent tokenized payment method", async () => {
		const transaction = await client.authorize.authorizeTokenizedPaymentMethod({
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O1111",
			description: null,
			customerId: "test customer 45342",
			currencyCode: "USD",
			amount: 1000,
			paymentMethodId: "TOTALLYMADEUP",
			customerIp: null,
			shippingAddress: null,
			gatewayToken: GATEWAY_TOKEN,
			paymentPlan: null,
			retryCount: 1,
			dateFirstAttempt: null,
			referenceData: null,
			disableCustomerRecovery: false,
			customVariable1: null,
			customVariable2: null,
			customVariable3: null,
			customVariable4: null,
			customVariable5: null,
			References: null
		});
		expect(transaction, "Tokenized Payment Method Auth should fail because the paymentMethodId was made up").toMatchObject({
			responseCode: ResponseCode.ApiInvalidValueForPaymentToken,
		});
	});

	it("should auth a gateway payment method", async () => {
		const gatewayPaymentMethodRequest = getBasicTokenizedPaymentMethodRequest<CreateTokenizedPaymentMethodRequest>();
		const paymentMethod = await client.paymentMethods.createdTokenizedPaymentMethod(gatewayPaymentMethodRequest);
		expect(paymentMethod).toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: {
				paymentMethodId: expect.stringMatching(/[A-Z0-9]+/),
			},
		});

		const transaction = await client.authorize.authorizeGatewayPaymentMethod({
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O1111",
			description: null,
			customerId: "test customer 45342",
			currencyCode: "USD",
			amount: 1000,
			paymentMethod: {
				gatewayPaymentMethodId: paymentMethod.paymentMethod.gatewayPaymentMethodId,
				merchantAccountReferenceId: paymentMethod.paymentMethod.merchantAccountReferenceId,
				firstName: "Joe",
				lastName: "Smith",
				postalCode: "84062",
				city: "Pleasant Grove",
				state: "UT",
			},
			customerIp: null,
			shippingAddress: null,
			gatewayToken: GATEWAY_TOKEN,
			paymentPlan: null,
			retryCount: 1,
			dateFirstAttempt: null,
			referenceData: null,
			disableCustomerRecovery: false,
			customVariable1: null,
			customVariable2: null,
			customVariable3: null,
			customVariable4: null,
			customVariable5: null,
			References: null
		});
		expect(transaction, "Tokenized Payment Method Auth should be approved").toMatchObject({
			responseCode: ResponseCode.Approved,
		});
	});
})

describe("Capture", () => {
	it("should fail to capture a non-existent auth", async () => {
		const requestOptions = {
			amount: 1000,
			disableCustomerRecovery: false,
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const result = await client.capture.capture("MADEUPTRANSACTIONID", requestOptions);

		const expectedResponse =
		{
			...EmptyObjectBuilder.captureResponse(),
			assignedGatewayToken: "",
			currencyCode: "USD",
			amount: requestOptions.amount,
			gatewayToken: "",
			gatewayType: "",
			orderId: "",
			paymentMethod: {
				...EmptyObjectBuilder.captureResponse().paymentMethod,
				customerId: expect.any(String),
				firstSixDigits: "",
				lastFourDigits: "",
				paymentMethodType: PaymentMethodType.CreditCard,
				storageState: StorageState.Cached,
			},
			transactionStatus: TransactionStatus.Declined,
			message: expect.stringContaining("not found"),
			responseCode: ResponseCode.ApiOriginalTransactionNotFound,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: requestOptions.disableCustomerRecovery,
		};

		expect(result, "Capture response should match expected values").toEqual(expectedResponse);
	});

	it("should fail to capture an incorrect amount", async () => {
		const authRequest:AuthorizeCreditCardRequest = {
			amount: 1000,
			currencyCode: "USD",
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O112233",
			paymentMethod: {
				creditCardNumber: sandbox.creditCards.masterCard.creditCardNumber,
				cvv: sandbox.creditCards.masterCard.cvv,
				expiryMonth: sandbox.creditCards.masterCard.expiryMonth,
				expiryYear: sandbox.creditCards.masterCard.expiryYear,
				firstName: "John",
				lastName: "Doe",
				address1: "123 B Street",
				city: "Pleasant Grove",
				state: "UT",
				postalCode: "84062",
			},
			retainOnSuccess: false,
			retryCount: 3,
			customerId: "CAPTURECUSTOMER1",
			gatewayToken: GATEWAY_TOKEN,
		};
		const authResult = await client.authorize.authorizeCreditCard(authRequest);

		expect(authResult.responseCode, "Auth Credit Card should be approved").toEqual(ResponseCode.Approved);

		const requestOptions = {
			amount: 1500,
			disableCustomerRecovery: false,
			merchantTransactionId: authRequest.merchantTransactionId,
		};
		const result = await client.capture.capture(authResult.transactionId, requestOptions);

		const expectedResponse =
		{
			...EmptyObjectBuilder.captureResponse(),
			assignedGatewayToken: "",
			currencyCode: "USD",
			amount: requestOptions.amount,
			gatewayToken: "",
			gatewayType: "",
			orderId: "",
			paymentMethod: {
				...EmptyObjectBuilder.captureResponse().paymentMethod,
				customerId: expect.any(String),
				firstSixDigits: "",
				lastFourDigits: "",
				paymentMethodType: PaymentMethodType.CreditCard,
				storageState: StorageState.Cached,
			},
			transactionStatus: TransactionStatus.Declined,
			message: expect.stringContaining("not found"),
			responseCode: ResponseCode.ApiInvalidAmount,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: requestOptions.disableCustomerRecovery,
		};

		expect(result, "Capture response should match expected values").toEqual(expectedResponse);
	});

	it.skip("should capture a credit card auth", async () => {
		const authRequest:AuthorizeCreditCardRequest = {
			amount: 1000,
			currencyCode: "USD",
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O112233",
			paymentMethod: {
				creditCardNumber: sandbox.creditCards.masterCard.creditCardNumber,
				cvv: sandbox.creditCards.masterCard.cvv,
				expiryMonth: sandbox.creditCards.masterCard.expiryMonth,
				expiryYear: sandbox.creditCards.masterCard.expiryYear,
				firstName: "John",
				lastName: "Doe",
				address1: "123 B Street",
				city: "Pleasant Grove",
				state: "UT",
				postalCode: "84062",
			},
			retainOnSuccess: false,
			retryCount: 3,
			customerId: "CAPTURECUSTOMER1",
			gatewayToken: GATEWAY_TOKEN,
		};
		const authResult = await client.authorize.authorizeCreditCard(authRequest);

		expect(authResult.responseCode, "Auth Credit Card should be approved").toEqual(ResponseCode.Approved);

		const requestOptions = {
			merchantTransactionId: authRequest.merchantTransactionId,
		};
		const result = await client.capture.capture(authResult.transactionId, requestOptions);

		const expectedResponse =
		{
			...EmptyObjectBuilder.captureResponse(),
			assignedGatewayToken: "",
			currencyCode: "USD",
			amount: authRequest.amount,
			gatewayToken: "",
			gatewayType: "",
			orderId: "",
			paymentMethod: {
				...EmptyObjectBuilder.captureResponse().paymentMethod,
				customerId: expect.any(String),
				firstSixDigits: "",
				lastFourDigits: "",
				paymentMethodType: PaymentMethodType.CreditCard,
				storageState: StorageState.Cached,
			},
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: authRequest.disableCustomerRecovery ?? false,
		};

		expect(result, "Capture results should match expected values").toEqual(expectedResponse);
	});

	it("should capture a tokenized payment method auth", async () => {
		const tokenizeRequest:CreateTokenizedPaymentMethodRequest = getBasicTokenizedPaymentMethodRequest({
			customerId: "CAPTURECUSTOMER1",
		});

		const tokenizeResult = await client.paymentMethods.createdTokenizedPaymentMethod(tokenizeRequest);
		expect(tokenizeResult.responseCode, "Tokenized Payment Method approved").toEqual(ResponseCode.Approved);

		const authRequest:AuthorizeTokenizedPaymentMethodRequest = {
			amount: 1000,
			currencyCode: "USD",
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O112233",
			paymentMethodId: tokenizeResult.paymentMethod.paymentMethodId,
			retryCount: 3,
			customerId: tokenizeRequest.customerId,
			gatewayToken: GATEWAY_TOKEN,
		};
		const authResult = await client.authorize.authorizeTokenizedPaymentMethod(authRequest);

		expect(authResult.responseCode, "Authorize tokenized payment method approved").toEqual(ResponseCode.Approved);

		const requestOptions = {
			merchantTransactionId: authRequest.merchantTransactionId,
		};
		const result = await client.capture.capture(authResult.transactionId, requestOptions);


		const expectedResponse =
		{
			...EmptyObjectBuilder.captureResponse(),
			assignedGatewayToken: "",
			currencyCode: "USD",
			amount: authRequest.amount,
			gatewayToken: "",
			gatewayType: "",
			orderId: "",
			paymentMethod: {
				...EmptyObjectBuilder.captureResponse().paymentMethod,
				customerId: expect.any(String),
				firstSixDigits: "",
				lastFourDigits: "",
				paymentMethodType: PaymentMethodType.CreditCard,
				storageState: StorageState.Cached,
			},
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: authRequest.disableCustomerRecovery ?? false,
		};

		expect(result, "Tokenized Auth then Capture response should match expected values").toEqual(expectedResponse);
	});

	it.skip("should capture a gateway payment method auth", async () => {
		const tokenizeRequest:CreateTokenizedPaymentMethodRequest = getBasicTokenizedPaymentMethodRequest({
			customerId: "CAPTURECUSTOMER1",
		});

		const tokenizeResult = await client.paymentMethods.createdTokenizedPaymentMethod(tokenizeRequest);
		expect(tokenizeResult.responseCode, "Tokenized Payment Method approved").toEqual(ResponseCode.Approved);

		const authRequest:AuthorizeTokenizedPaymentMethodRequest = {
			amount: 1000,
			currencyCode: "USD",
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O112233",
			paymentMethodId: tokenizeResult.paymentMethod.paymentMethodId,
			retryCount: 3,
			customerId: tokenizeRequest.customerId,
			gatewayToken: GATEWAY_TOKEN,
		};
		const authResult = await client.authorize.authorizeTokenizedPaymentMethod(authRequest);

		expect(authResult.responseCode, "Authorize tokenized payment method approved").toEqual(ResponseCode.Approved);

		const requestOptions = {
			merchantTransactionId: authRequest.merchantTransactionId,
		};
		const result = await client.capture.capture(authResult.transactionId, requestOptions);


		const expectedResponse =
		{
			...EmptyObjectBuilder.captureResponse(),
			currencyCode: authResult.currencyCode,
			amount: authResult.amount,
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: authRequest.disableCustomerRecovery ?? false,
		};

		expect(result, "Gateway Auth then Capture response should match expected values").toEqual(expectedResponse);
	});
})

describe("Void", () => {
	it("should void a credit card charge", async () => {
		const chargeRequest = getBasicChargeRequest();
		const chargeResponse = await client.charge.chargeCreditCard(chargeRequest);
		expect(chargeResponse.responseCode, "Credit Card Charge should be created").toEqual(ResponseCode.Approved);

		await sleep(10);

		const voidRequest:VoidRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const voidResponse = await client.void.void(chargeResponse.transactionId, voidRequest);

		let expectedResponse:VoidResponse = EmptyObjectBuilder.voidResponse() as unknown as VoidResponse;
		expectedResponse =
		{
			...expectedResponse,
			currencyCode: chargeResponse.currencyCode,
			description: chargeResponse.description,
			gatewayTransactionId: expect.any(String),
			merchantAccountReferenceId: expect.any(String),
			amount: chargeResponse.amount,
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			message: expect.stringContaining("Approved"),
			merchantTransactionId: voidRequest.merchantTransactionId,
			disableCustomerRecovery: voidRequest.disableCustomerRecovery ?? false,
			paymentMethod: {
				...chargeResponse.paymentMethod,
				dateCreated: expect.any(Date),
			},
			response: chargeResponse.response,
			shippingAddress: chargeResponse.shippingAddress,
		} as unknown as VoidResponse;

		expect(voidResponse, "Void response to match expected values").toEqual(expectedResponse);
	});

	it("should void a credit card auth", async () => {
		const authRequest = getBasicAuthRequest();
		const authResponse = await client.authorize.authorizeCreditCard(authRequest);
		expect(authResponse.responseCode, "Credit Card Auth should be approved").toEqual(ResponseCode.Approved);

		await sleep(10);

		const voidRequest:VoidRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const voidResponse = await client.void.void(authResponse.transactionId, voidRequest);

		let expectedResponse:VoidResponse = EmptyObjectBuilder.voidResponse() as unknown as VoidResponse;
		expectedResponse =
		{
			...expectedResponse,
			currencyCode: authResponse.currencyCode,
			description: authResponse.description,
			gatewayTransactionId: expect.any(String),
			merchantAccountReferenceId: expect.any(String),
			amount: authResponse.amount,
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			message: expect.stringContaining("Approved"),
			merchantTransactionId: voidRequest.merchantTransactionId,
			disableCustomerRecovery: voidRequest.disableCustomerRecovery ?? false,
			paymentMethod: {
				...authResponse.paymentMethod,
				dateCreated: expect.any(Date),
			},
			response: authResponse.response,
			shippingAddress: authResponse.shippingAddress,
		} as unknown as VoidResponse;

		expect(voidResponse, "Void response to match expected values").toEqual(expectedResponse);
	});

	it("should fail to void a non-existent transaction", async () => {
		const voidRequest:VoidRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const voidResponse = await client.void.void("MADEUPTXNIDFORVOID", voidRequest);

		const expectedResponse =
		{
			...EmptyObjectBuilder.voidResponse(),
			transactionStatus: TransactionStatus.Declined,
			responseCode: ResponseCode.ApiOriginalTransactionNotFound,
			message: expect.stringContaining("not found"),
			merchantTransactionId: voidRequest.merchantTransactionId,
			disableCustomerRecovery: voidRequest.disableCustomerRecovery ?? false,
		};

		expect(voidResponse, "Void response to match expected values").toEqual(expectedResponse);
	});
});

describe("Refund", () => {
	it("should refund a credit card charge", async () => {
		const chargeRequest = getBasicChargeRequest();
		const chargeResponse = await client.charge.chargeCreditCard(chargeRequest);
		expect(chargeResponse.responseCode, "Credit Card Charge should be created").toEqual(ResponseCode.Approved);

		await sleep(10);

		const refundRequest:RefundRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const refundResponse = await client.refund.refund(chargeResponse.transactionId, refundRequest);

		let expectedResponse:RefundResponse = EmptyObjectBuilder.refundResponse() as unknown as RefundResponse;
		expectedResponse =
		{
			...expectedResponse,
			currencyCode: chargeResponse.currencyCode,
			description: chargeResponse.description,
			gatewayTransactionId: expect.any(String),
			merchantAccountReferenceId: expect.any(String),
			amount: chargeResponse.amount,
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			message: expect.stringContaining("Approved"),
			merchantTransactionId: refundRequest.merchantTransactionId,
			disableCustomerRecovery: refundRequest.disableCustomerRecovery ?? false,
			paymentMethod: {
				...chargeResponse.paymentMethod,
				dateCreated: expect.any(Date),
			},
			response: chargeResponse.response,
			shippingAddress: chargeResponse.shippingAddress,
		} as unknown as RefundResponse;

		expect(refundResponse, "Refund response to match expected values").toEqual(expectedResponse);
	});

	it("should refund a partial", async () => {
		const chargeRequest = getBasicChargeRequest();
		const chargeResponse = await client.charge.chargeCreditCard(chargeRequest);
		expect(chargeResponse.responseCode, "Credit Card Charge should be created").toEqual(ResponseCode.Approved);

		await sleep(10);

		const refundRequest:RefundRequest = {
			amount: Math.floor(chargeRequest.amount / 2),
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const refundResponse = await client.refund.refund(chargeResponse.transactionId, refundRequest);

		let expectedResponse:RefundResponse = EmptyObjectBuilder.refundResponse() as unknown as RefundResponse;
		expectedResponse =
		{
			...expectedResponse,
			currencyCode: chargeResponse.currencyCode,
			description: chargeResponse.description,
			gatewayTransactionId: expect.any(String),
			merchantAccountReferenceId: expect.any(String),
			amount: refundRequest.amount,
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			message: expect.stringContaining("Approved"),
			merchantTransactionId: refundRequest.merchantTransactionId,
			disableCustomerRecovery: refundRequest.disableCustomerRecovery ?? false,
			paymentMethod: {
				...chargeResponse.paymentMethod,
				dateCreated: expect.any(Date),
			},
			response: chargeResponse.response,
			shippingAddress: chargeResponse.shippingAddress,
		} as unknown as RefundResponse;

		expect(refundResponse, "Refund response to match expected values").toEqual(expectedResponse);
	});

	it("should fail to refund a non-existent transaction", async () => {
		const refundRequest:RefundRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const refundResponse = await client.refund.refund("ANONEXISTENTVALUE", refundRequest);

		const expectedResponse =
		{
			...EmptyObjectBuilder.refundResponse(),
			transactionStatus: TransactionStatus.Declined,
			responseCode: ResponseCode.ApiOriginalTransactionNotFound,
			message: expect.stringContaining("not found"),
			merchantTransactionId: refundRequest.merchantTransactionId,
			disableCustomerRecovery: refundRequest.disableCustomerRecovery ?? false,
		};

		expect(refundResponse, "Refund response to match expected values").toEqual(expectedResponse);

	});

	it("should fail to refund above the original amount", async () => {
		const chargeRequest = getBasicChargeRequest();
		const chargeResponse = await client.charge.chargeCreditCard(chargeRequest);
		expect(chargeResponse.responseCode, "Credit Card Charge should be created").toEqual(ResponseCode.Approved);

		await sleep(10);

		const refundRequest:RefundRequest = {
			amount: chargeRequest.amount + 500,
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const refundResponse = await client.refund.refund(chargeResponse.transactionId, refundRequest);

		let expectedResponse:RefundResponse = EmptyObjectBuilder.refundResponse() as unknown as RefundResponse;
		expectedResponse =
		{
			...expectedResponse,
			currencyCode: chargeResponse.currencyCode,
			description: chargeResponse.description,
			gatewayTransactionId: expect.any(String),
			merchantAccountReferenceId: expect.any(String),
			amount: refundRequest.amount,
			transactionStatus: TransactionStatus.Declined,
			responseCode: ResponseCode.HardDeclineInvalidAmount,
			message: expect.stringContaining("invalid amount"),
			merchantTransactionId: refundRequest.merchantTransactionId,
			disableCustomerRecovery: refundRequest.disableCustomerRecovery ?? false,
			paymentMethod: {
				...chargeResponse.paymentMethod,
				dateCreated: expect.any(Date),
			},
			response: {
				...chargeResponse.response,
				cvvMessage: expect.stringContaining("invalid amount"),
			},
			shippingAddress: chargeResponse.shippingAddress,
		} as unknown as RefundResponse;

		expect(refundResponse, "Refund response to match expected values").toEqual(expectedResponse);
	});
});
