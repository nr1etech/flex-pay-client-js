import { FlexPayTransactionClient, sandbox, PaymentModel, ChargeCreditCardRequest, ResponseError, SortOrder, ResponseCode, AuthorizeCreditCardRequest, TransactionStatus, PaymentMethodType, StorageState, AuthorizeTokenizedPaymentMethodRequest, VoidRequest, AvsResponseCode, CvvResponseCode, ChargeGatewayPaymentMethodRequest, RefundRequest, AuthorizationError, ChargeTokenizedPaymentMethodRequest, AddressResponse, VoidResponse, RefundResponse, TransactionType, AuthorizeGatewayPaymentMethodRequest, TokenizeCreditCardPaymentMethodRequest, TokenizeGatewayPaymentMethodRequest } from "../../src";
import { consoleJson, EmptyObjectBuilder, generateUniqueMerchantTransactionId, sleep } from "../test-helper";
jest.setTimeout(300000);	// 5 minutes

const POST_TRANSACTION_WAIT_TIME_SEC = 10;
let GATEWAY_TOKEN:string;
let AUTHORIZATION_TOKEN:string;
let MERCHANT_ACCOUNT_REFERENCE_ID:string;
let client:FlexPayTransactionClient;

beforeAll(() => {
	consoleJson(undefined);	// Just calling this so TS doesn't complain about the import

	GATEWAY_TOKEN = process.env["X_FP_GATEWAY_TOKEN"] as string;
	AUTHORIZATION_TOKEN = process.env["X_FP_AUTH_TOKEN"] as string;
	MERCHANT_ACCOUNT_REFERENCE_ID = process.env["X_FP_MERCHANT_ACCOUNT_REFERENCE_ID"] as string;
	client = new FlexPayTransactionClient({
		authorizationToken: AUTHORIZATION_TOKEN,
		debugOutput: false,
	});
});

beforeEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

function getBasicTokenizeCreditCardRequest(requestOverride?:Record<string, unknown>|undefined, creditCardOverride?:Record<string, unknown>|undefined):TokenizeCreditCardPaymentMethodRequest {
	return {
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
	} as TokenizeCreditCardPaymentMethodRequest;
};

function getBasicTokenizeGatewayPaymentMethodRequest(requestOverride?:Record<string, unknown>|undefined, paymentMethodOverride?:Record<string, unknown>|undefined):TokenizeGatewayPaymentMethodRequest {
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
	} as TokenizeGatewayPaymentMethodRequest;
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
	it("should tokenize a credit card", async () => {
		const response = await client.paymentMethods.tokenizeCreditCard(
			getBasicTokenizeCreditCardRequest({
				customerId: "integration test customer 1",
			}),
		);

		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);
	});

	it("should fail to tokenize a credit card on invalid card data", async () => {
		const response = await client.paymentMethods.tokenizeCreditCard(
			getBasicTokenizeCreditCardRequest({
				customerId: "integration test customer 2",
			}, {
				creditCardNumber: "123456",
			}
		));
		expect(response.responseCode, "Credit Card Payment Method: Card number too short").toEqual(ResponseCode.ApiInvalidCreditCardNumberLength);
	});

	it("should tokenize a gateway payment method", async () => {
		const response = await client.paymentMethods.tokenizeGatewayPaymentMethod(
			getBasicTokenizeGatewayPaymentMethodRequest({
				customerId: "integration test customer 2",
			})
		);
		expect(response.responseCode, "Gateway Payment Method approved").toEqual(ResponseCode.Approved);
	});

	it("should fail on invalid gateway payment method data", async () => {
		const response = await client.paymentMethods.tokenizeGatewayPaymentMethod(
			getBasicTokenizeGatewayPaymentMethodRequest({
				customerId: "integration test customer 3",
			}, {
				firstName: "",
				lastName: "",
				fullName: null,
			})
		);
		expect(response.responseCode, "Gatway Payment Method missing name fields").toEqual(ResponseCode.ApiFullnameOrFirstLastRequired);
	});

	it("should get a list of payment methods", async () => {
		let paymentMethods = await client.paymentMethods.getPaymentMethodList(null, 1, SortOrder.Descending);
		expect(paymentMethods.length, "Get a list of payment methods").toBeGreaterThanOrEqual(1);

		paymentMethods = await client.paymentMethods.getPaymentMethodList(paymentMethods[paymentMethods.length - 1].paymentMethodId, 1, SortOrder.Descending);
		expect(paymentMethods.length, "Get the next page of payment methods").toBeGreaterThanOrEqual(1);
	});

	it("should get a payment method", async () => {
		const response = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest());
		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const paymentMethod = await client.paymentMethods.getPaymentMethod(response.paymentMethod.paymentMethodId);
		expect(paymentMethod, "Loaded payment method should match").toEqual(response.paymentMethod);

	});

	it("should update a credit card payment method", async () => {
		const createResponse = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest(undefined, {
			firstName: "John",
			email: "jdoe@example.com",
		}));
		expect(createResponse.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const propertiesToUpdate = {
			firstName: "Jane",
			email: "jane@example.com",
		};

		const updateResponse = await client.paymentMethods.updatePaymentMethod(createResponse.paymentMethod.paymentMethodId, propertiesToUpdate);
		expect(updateResponse.responseCode, "Update payment method should be approved").toEqual(ResponseCode.Approved);

		let expectedResponse:any = EmptyObjectBuilder.paymentMethodUpdateResponse();
		expectedResponse = {
			...expectedResponse,
			responseCode: ResponseCode.Approved,
			customerId: createResponse.customerId,
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...createResponse.paymentMethod,
				...propertiesToUpdate,
			},
			transactionDate: expect.any(Date),
			transactionId: expect.any(String),
			transactionStatus: TransactionStatus.Approved,
		};

		expect(updateResponse, "Update Payment response object should match the expected results").toEqual(expectedResponse);
	});

	it("should update a gateway payment method", async () => {
		const createResponse = await client.paymentMethods.tokenizeGatewayPaymentMethod(getBasicTokenizeGatewayPaymentMethodRequest(undefined, {
			firstName: "John",
			email: "jdoe@example.com",
		}));
		expect(createResponse.responseCode, "Gateway Payment Method approved").toEqual(ResponseCode.Approved);

		const propertiesToUpdate = {
			firstName: "Jane",
			email: "jane@example.com",
		};

		const updateResponse = await client.paymentMethods.updatePaymentMethod(createResponse.paymentMethod.paymentMethodId, propertiesToUpdate);
		expect(updateResponse.responseCode, "Update payment method should be approved").toEqual(ResponseCode.Approved);

		let expectedResponse:any = EmptyObjectBuilder.paymentMethodUpdateResponse();
		expectedResponse = {
			...expectedResponse,
			responseCode: ResponseCode.Approved,
			customerId: createResponse.customerId,
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...createResponse.paymentMethod,
				...propertiesToUpdate,
			},
			transactionDate: expect.any(Date),
			transactionId: expect.any(String),
			transactionStatus: TransactionStatus.Approved,
		};

		expect(updateResponse, "Update Payment response object should match the expected results").toEqual(expectedResponse);

	});

	// FIXME -- does not accept null values, the tokenize payment method accepts null values but they should be allowed to be set to null here
	it.skip("should accept null values when updating a payment method", async () => {
		const createResponse = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest(undefined, {
			firstName: "John",
			email: "jdoe@example.com",
		}));
		expect(createResponse.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const propertiesToUpdate = {
			firstName: "Jane",
			email: null,
		};

		const updateResponse = await client.paymentMethods.updatePaymentMethod(createResponse.paymentMethod.paymentMethodId, propertiesToUpdate);
		expect(updateResponse.responseCode, "Update payment method should be approved").toEqual(ResponseCode.Approved);

		let expectedResponse:any = EmptyObjectBuilder.paymentMethodUpdateResponse();
		expectedResponse = {
			...expectedResponse,
			paymentMethod: {
				...createResponse.paymentMethod,
				...propertiesToUpdate,
			},
			responseCode: ResponseCode.Approved,
			customerId: createResponse.customerId,
			transactionStatus: TransactionStatus.Approved,
			transactionType: TransactionType.UpdatePaymentMethod,
		};

		expect(updateResponse, "Update Payment response object should match the expected results").toEqual(expectedResponse);
	});

	it("should fail to update a payment method with no update data in the body", async () => {
		const response = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest());
		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		try {
			await client.paymentMethods.updatePaymentMethod(response.paymentMethod.paymentMethodId, { });
			expect("Update payment method should should have thrown").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(ResponseError);
			expect((ex as Error).message).toContain("no editable field");
		}
	});

	it("should fail to update a tokenized credit card payment method with invalid data", async () => {
		const response = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest());
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

	// FIXME -- doesn't redact the numbers. Waiting for a fix (cannot test if values are actually redacted because we cannot transaction tokenized credit cards)
	it.skip("should redact a payment method", async () => {
		const response = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest());
		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const redactResponse = await client.paymentMethods.redactPaymentMethod(response.paymentMethod.paymentMethodId);
		expect(redactResponse.responseCode, "Payment method Redact command should be approved").toEqual(ResponseCode.Approved);

		const getResponse = await client.paymentMethods.getPaymentMethod(response.paymentMethod.paymentMethodId);
		expect(getResponse.creditCardNumber, "Payment method credit card number should be removed").toEqual("");
	});

	// FIXME -- transactions involving tokenized credit card payments give an error saying "No gateways are configured to process the submitted card type."
	it.skip("should fail to charge a redacted tokenized payment method", async () => {
		const paymentMethodResponse = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest());
		expect(paymentMethodResponse.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const redactResponse = await client.paymentMethods.redactPaymentMethod(paymentMethodResponse.paymentMethod.paymentMethodId);
		expect(redactResponse.responseCode, "Payment method Redact command should be approved").toEqual(ResponseCode.Approved);

		const chargeRequest:any = getBasicChargeRequest();
		delete chargeRequest.paymentMethod;
		chargeRequest.paymentMethodId = paymentMethodResponse.paymentMethod.paymentMethodId;

		const chargeResponse = await client.charge.chargeTokenizedPaymentMethod(chargeRequest);

		expect(chargeResponse.responseCode, "Tokenized Payment Method Charge should fail").toEqual(ResponseCode.Approved);
	});

	it.each([
		["Made up CVV", "999"],
		["Sandbox CVV", sandbox.creditCards.visa.cvv],
	])("should recache the CVV value (%s: %s)", async (testName:string, cvv:string) => {
		const response = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest());
		expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const paymentMethodId = response.paymentMethod.paymentMethodId;

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
			paymentModel: chargeRequest.paymentModel,
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
			},
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
			paymentModel: chargeRequest.paymentModel,
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
			await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes
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

	// FIXME -- transactions involving tokenized credit card payments give an error saying "No gateways are configured to process the submitted card type."
	it.skip("should charge a tokenized credit card payment method", async () => {
		const paymentMethod = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest({
			customerId: "CUSTOMERWITHSTOREDPAYMENTMETHOD",
		}));
		expect(paymentMethod).toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: {
				paymentMethodId: expect.stringMatching(/[A-Z0-9]+/),
			},
		});

		//await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

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

		let expectedResponse:any = EmptyObjectBuilder.chargeResponse();
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
				avsCode: AvsResponseCode.AvsNotSupported,
			},
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...paymentMethod.paymentMethod,
			},
		};

		expect(chargeResponse, "Tokenized Payment Method response should match expected values").toEqual(expectedResponse);
	});

	it("should charge a tokenized gateway payment method", async () => {
		const paymentMethod = await client.paymentMethods.tokenizeGatewayPaymentMethod(getBasicTokenizeGatewayPaymentMethodRequest());
		expect(paymentMethod).toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: {
				paymentMethodId: expect.stringMatching(/[A-Z0-9]+/),
			},
		});

		//await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

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
			paymentModel: PaymentModel.OneTime,
		};

		const chargeResponse = await client.charge.chargeTokenizedPaymentMethod(chargeRequest);

		let expectedResponse:any = EmptyObjectBuilder.chargeResponse();
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
				avsCode: AvsResponseCode.AvsNotSupported,
			},
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...paymentMethod.paymentMethod,
			},
		};

		expect(chargeResponse, "Gateway Tokenized Payment Method response should match expected values").toEqual(expectedResponse);
	});

	// FIXME - Currently skipped because charging tokenized payment methods fail in the wrong way, waiting for a fix
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
		const chargeRequest:ChargeGatewayPaymentMethodRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O1111",
			customerId: "test customer 45342",
			currencyCode: "USD",
			amount: 1000,
			paymentMethod: {
				gatewayPaymentMethodId: "test-gateway-payment-method-id",
				merchantAccountReferenceId: "the merchant account reference id",
				firstName: "John",
				lastName: "Doe",
				postalCode: "84043",
				city: "Lehi",
				state: "UT",
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
			paymentModel: chargeRequest.paymentModel,
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
				gatewayPaymentMethodId: chargeRequest.paymentMethod.gatewayPaymentMethodId,
				merchantAccountReferenceId: chargeRequest.paymentMethod.merchantAccountReferenceId,
				creditCardNumber: expect.any(String),
				cvv: "",
				customerId: chargeRequest.customerId,

				firstName: chargeRequest.paymentMethod.firstName,
				lastName: chargeRequest.paymentMethod.lastName,

				fullName: expect.any(String),
				firstSixDigits: expect.any(String),
				lastFourDigits: expect.any(String),
				paymentMethodType: PaymentMethodType.GatewayPaymentMethodId,
				storageState: StorageState.Cached,

				city: chargeRequest.paymentMethod.city,
				state: chargeRequest.paymentMethod.state,
				postalCode: chargeRequest.paymentMethod.postalCode,
			}
		};

		expect(chargeResponse, "Gateway Payment Method response should match expected values").toEqual(expectedResponse);
	});

});

function getBasicCreditCardAuthRequest(override?:Record<string, unknown>):AuthorizeCreditCardRequest {
	const request:AuthorizeCreditCardRequest = {
		amount: 1000,	// $10.00
		currencyCode: "USD",
		customerId: "test",
		customerIp: "196.168.1.123",
		dateFirstAttempt: new Date(),
		description: "Test credit card auth",
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

function getBasicGatewayAuthRequest(override?:Record<string, unknown>):AuthorizeGatewayPaymentMethodRequest {
	const request:AuthorizeGatewayPaymentMethodRequest = {
		amount: 1000,	// $10.00
		currencyCode: "USD",
		customerId: "test",
		customerIp: "196.168.1.123",
		dateFirstAttempt: new Date(),
		description: "Test gateway auth",
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

			gatewayPaymentMethodId: "TEST_GATEWAY_PAYMENT_METHOD_ID",
			merchantAccountReferenceId: MERCHANT_ACCOUNT_REFERENCE_ID,
			firstSixDigits: sandbox.creditCards.visa.creditCardNumber.slice(0, 6),
			lastFourDigits: sandbox.creditCards.visa.creditCardNumber.slice(-4),

			phoneNumber: "8015551234",
			email: "johndoe@example.com",
			firstName: "John",
			lastName: "Doe",
			fullName: null,
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
		retryCount: 1,
		...override,
	};

	return request;
}

describe("Authorize", () => {
	it("should approve a credit card", async () => {
		const authRequest = getBasicCreditCardAuthRequest();
		const authResponse = await client.authorize.authorizeCreditCard(authRequest);

		let expectedResponse:any = EmptyObjectBuilder.authResponse();
		expectedResponse = {
			...expectedResponse,
			description: authRequest.description,
			amount: authRequest.amount,
			currencyCode: authRequest.currencyCode,
			customerId: authRequest.customerId,
			customerIp: authRequest.customerIp,
			orderId: authRequest.orderId,
			paymentModel: authRequest.paymentModel,
			retryCount: authRequest.retryCount,
			responseCode: ResponseCode.Approved,
			transactionStatus: TransactionStatus.Approved,
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...authRequest.paymentMethod,
				cardType: sandbox.creditCards.visa.cardType,
				creditCardNumber: expect.stringContaining(authRequest.paymentMethod.creditCardNumber.slice(0, 6)),
				cvv: "***",
				customerId: authRequest.customerId,
				fullName: expect.stringMatching(`${authRequest.paymentMethod.firstName} ${authRequest.paymentMethod.lastName}`),
				firstSixDigits: expect.stringMatching(authRequest.paymentMethod.creditCardNumber.slice(0, 6)),
				lastFourDigits: expect.stringMatching(authRequest.paymentMethod.creditCardNumber.slice(-4)),
				paymentMethodType: PaymentMethodType.CreditCard,
				storageState: StorageState.Cached,
			},
			response: {
				...expectedResponse.response,
				avsCode: AvsResponseCode.AvsNotSupported,
				cvvCode: CvvResponseCode.Match,
			},
			shippingAddress: {
				...expectedResponse.shippingAddress,
				...authRequest.shippingAddress,
			},
		};
		expect(authResponse, "Should match expected response values").toEqual(expectedResponse);
	});

	it("should approve a gateway payment", async () => {
		const authRequest = getBasicGatewayAuthRequest();
		const authResponse = await client.authorize.authorizeGatewayPaymentMethod(authRequest);

		let expectedResponse:any = EmptyObjectBuilder.authResponse();
		expectedResponse = {
			...expectedResponse,
			amount: authRequest.amount,
			currencyCode: authRequest.currencyCode,
			customerId: authRequest.customerId,
			customerIp: authRequest.customerIp,
			description: authRequest.description,
			orderId: authRequest.orderId,
			paymentModel: authRequest.paymentModel,
			retryCount: authRequest.retryCount,
			responseCode: ResponseCode.Approved,
			transactionStatus: TransactionStatus.Approved,
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...authRequest.paymentMethod,
			},
			response: {
				...expectedResponse.response,
				avsCode: AvsResponseCode.AvsNotSupported,
				cvvCode: CvvResponseCode.Match,
			},
			shippingAddress: {
				...expectedResponse.shippingAddress,
				...authRequest.shippingAddress,
			},
		};
		expect(authResponse, "Should match expected response values").toEqual(expectedResponse);
	});

	it("should fail if a malformed payload is sent", async () => {
		const request = getBasicCreditCardAuthRequest({ dateFirstAttempt: "bad value" });

		try {
			await client.authorize.authorizeCreditCard(request)
		} catch (ex) {
			expect(ex, "Should have thrown a ResponseError").toBeInstanceOf(ResponseError);
		}
	});

	// FIXME -- retainOnSuccess is not working as described in the documentation
	it.skip("should retain the payment info in the vault", async () => {
		const request = getBasicCreditCardAuthRequest({
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
			await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

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

	// FIXME -- transactions involving tokenized credit card payments give an error saying "No gateways are configured to process the submitted card type."
	it.skip("should approve a tokenized credit card payment method", async () => {
		const paymentMethodResponse = await client.paymentMethods.tokenizeCreditCard(getBasicTokenizeCreditCardRequest());
		expect(paymentMethodResponse).toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: {
				paymentMethodId: expect.stringMatching(/[A-Z0-9]+/),
			},
		});

		const authRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O1111",
			description: null,
			customerId: "test customer 45342",
			currencyCode: "USD",
			amount: 1000,
			paymentMethodId: paymentMethodResponse.paymentMethod.paymentMethodId,
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
			paymentModel: PaymentModel.Subscription,
		}

		const authResponse = await client.authorize.authorizeTokenizedPaymentMethod(authRequest);

		let expectedResponse:any = EmptyObjectBuilder.authResponse();
		expectedResponse = {
			...expectedResponse,
			amount: authRequest.amount,
			currencyCode: authRequest.currencyCode,
			customerId: authRequest.customerId,
			customerIp: authRequest.customerIp,
			orderId: authRequest.orderId,
			paymentModel: authRequest.paymentModel,
			retryCount: authRequest.retryCount,
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...paymentMethodResponse.paymentMethod,
			},
			responseCode: ResponseCode.Approved,
			transactionStatus: TransactionStatus.Approved,
		};

		expect(authResponse, "Tokenized Payment Method Auth should be created").toEqual(expectedResponse);
	});

	it("should approve a tokenized gateway payment method", async () => {
		const paymentMethodResponse = await client.paymentMethods.tokenizeGatewayPaymentMethod(getBasicTokenizeGatewayPaymentMethodRequest());
		expect(paymentMethodResponse).toMatchObject({
			responseCode: ResponseCode.Approved,
			paymentMethod: {
				paymentMethodId: expect.stringMatching(/[A-Z0-9]+/),
			},
		});

		const authRequest = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O1111",
			description: null,
			customerId: "test customer 45342",
			currencyCode: "USD",
			amount: 1000,
			paymentMethodId: paymentMethodResponse.paymentMethod.paymentMethodId,
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
			paymentModel: PaymentModel.Subscription,
		}

		const authResponse = await client.authorize.authorizeTokenizedPaymentMethod(authRequest);

		let expectedResponse:any = EmptyObjectBuilder.authResponse();
		expectedResponse = {
			...expectedResponse,
			amount: authRequest.amount,
			currencyCode: authRequest.currencyCode,
			customerId: authRequest.customerId,
			customerIp: authRequest.customerIp,
			orderId: authRequest.orderId,
			paymentModel: authRequest.paymentModel,
			retryCount: authRequest.retryCount,
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...paymentMethodResponse.paymentMethod,
			},
			response: {
				...expectedResponse.response,
				avsCode: AvsResponseCode.AvsNotSupported,
				cvvCode: CvvResponseCode.Match,
			},
			responseCode: ResponseCode.Approved,
			transactionStatus: TransactionStatus.Approved,
		};

		expect(authResponse, "Tokenized Payment Method Auth should be created").toEqual(expectedResponse);
	});

	// FIXME -- transactions involving tokenized credit card payments give an error saying "No gateways are configured to process the submitted card type."
	it.skip("should fail to auth a non-existent tokenized credit card payment method", async () => {
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

});

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
			gatewayTransactionId: null,
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
			response: {
				avsCode: null,
				avsMessage: null,
				cvvCode: null,
				cvvMessage: null,
				errorCode: null,
				errorDetail: null,
			},
			transactionStatus: TransactionStatus.Declined,
			message: expect.stringContaining("not found"),
			responseCode: ResponseCode.ApiOriginalTransactionNotFound,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: requestOptions.disableCustomerRecovery,
			merchantAccountReferenceId: null,
		};

		expect(result, "Capture response should match expected values").toEqual(expectedResponse);
	});

	// FIXME - The transaction is approved but I expected it be declined because the amount exceeds the original auth amount
	it.skip("should fail to capture an incorrect amount", async () => {
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

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

		const requestOptions = {
			amount: 10000,
			disableCustomerRecovery: false,
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const result = await client.capture.capture(authResult.transactionId, requestOptions);

		let expectedResponse:any = EmptyObjectBuilder.captureResponse();
		expectedResponse =
		{
			...expectedResponse,
			assignedGatewayToken: authResult.assignedGatewayToken,
			gatewayToken: authResult.gatewayToken,
			gatewayType: authResult.gatewayType,
			currencyCode: "USD",
			amount: requestOptions.amount,
			orderId: authResult.orderId,
			paymentMethod: {
				...authResult.paymentMethod,
				dateCreated: expect.any(Date),
			},
			transactionStatus: TransactionStatus.Declined,
			message: expect.stringContaining("not found"),
			responseCode: ResponseCode.ApiInvalidAmount,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: requestOptions.disableCustomerRecovery,
		};

		expect(result, "Capture response should match expected values").toEqual(expectedResponse);
	});

	it("should capture a credit card auth", async () => {
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

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);

		const requestOptions = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const result = await client.capture.capture(authResult.transactionId, requestOptions);

		let expectedResponse:any = EmptyObjectBuilder.captureResponse();
		expectedResponse =
		{
			...expectedResponse,
			assignedGatewayToken: authResult.assignedGatewayToken,
			currencyCode: "USD",
			amount: authRequest.amount,
			gatewayToken: authResult.gatewayToken,
			gatewayType: authResult.gatewayType,
			orderId: authRequest.orderId,
			paymentMethod: {
				...EmptyObjectBuilder.captureResponse().paymentMethod,
				...authResult.paymentMethod,
				dateCreated: expect.any(Date),
			},
			response: {
				...expectedResponse.response,
				avsCode: AvsResponseCode.AvsNotSupported,
				cvvCode: CvvResponseCode.Match,
			},
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: authRequest.disableCustomerRecovery ?? false,
		};

		expect(result, "Capture results should match expected values").toEqual(expectedResponse);
	});

	it("should capture a gateway payment auth", async () => {
		const authRequest:AuthorizeGatewayPaymentMethodRequest = {
			amount: 1000,
			currencyCode: "USD",
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O112233",
			paymentMethod: {
				gatewayPaymentMethodId: "TEST_GATEWAY_PAYMENT_METHOD_ID",
				merchantAccountReferenceId: "MERCHANGEACCOUNTREFERENCEID",
				firstName: "John",
				lastName: "Doe",
				address1: "123 B Street",
				city: "Pleasant Grove",
				state: "UT",
				postalCode: "84062",
			},
			retryCount: 3,
			customerId: "CAPTURECUSTOMER1",
			gatewayToken: GATEWAY_TOKEN,
		};
		const authResult = await client.authorize.authorizeGatewayPaymentMethod(authRequest);

		expect(authResult.responseCode, "Auth Gateway Payment should be approved").toEqual(ResponseCode.Approved);

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);

		const requestOptions = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const result = await client.capture.capture(authResult.transactionId, requestOptions);

		let expectedResponse:any = EmptyObjectBuilder.captureResponse();
		expectedResponse =
		{
			...expectedResponse,
			assignedGatewayToken: authResult.assignedGatewayToken,
			currencyCode: "USD",
			amount: authRequest.amount,
			gatewayToken: authResult.gatewayToken,
			gatewayType: authResult.gatewayType,
			orderId: authRequest.orderId,
			paymentMethod: {
				...EmptyObjectBuilder.captureResponse().paymentMethod,
				...authResult.paymentMethod,
				dateCreated: expect.any(Date),
			},
			response: {
				...expectedResponse.response,
				avsCode: AvsResponseCode.AvsNotSupported,
				cvvCode: CvvResponseCode.Match,
			},
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: authRequest.disableCustomerRecovery ?? false,
		};

		expect(result, "Capture results should match expected values").toEqual(expectedResponse);
	});

	// FIXME -- transactions involving tokenized credit card payments give an error saying "No gateways are configured to process the submitted card type."
	it.skip("should capture a tokenized credit card auth", async () => {
		const createCreditCardPaymentMethodRequest = getBasicTokenizeCreditCardRequest({
			customerId: "CAPTURECUSTOMER1",
		});

		const creditCardPaymentResponse = await client.paymentMethods.tokenizeCreditCard(createCreditCardPaymentMethodRequest);
		expect(creditCardPaymentResponse.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

		const authRequest:AuthorizeTokenizedPaymentMethodRequest = {
			amount: 1000,
			currencyCode: "USD",
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O112233",
			paymentMethodId: creditCardPaymentResponse.paymentMethod.paymentMethodId,
			retryCount: 3,
			customerId: creditCardPaymentResponse.customerId,
			gatewayToken: GATEWAY_TOKEN,
		};
		const authResult = await client.authorize.authorizeTokenizedPaymentMethod(authRequest);

		expect(authResult.responseCode, "Authorize tokenized payment method approved").toEqual(ResponseCode.Approved);

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

		const requestOptions = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const result = await client.capture.capture(authResult.transactionId, requestOptions);

		let expectedResponse:any = EmptyObjectBuilder.captureResponse();
		expectedResponse =
		{
			...expectedResponse,
			response: {
				...expectedResponse.response,
				avsCode: AvsResponseCode.AvsNotSupported,
				cvvCode: CvvResponseCode.Match,
			},
			assignedGatewayToken: authResult.assignedGatewayToken,
			currencyCode: "USD",
			amount: authRequest.amount,
			gatewayToken: authResult.gatewayToken,
			gatewayType: authResult.gatewayType,
			orderId: authResult.orderId,
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...authResult.paymentMethod,
				dateCreated: expect.any(Date),
			},
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: authRequest.disableCustomerRecovery ?? false,
		};

		expect(result, "Tokenized Auth then Capture response should match expected values").toEqual(expectedResponse);
	});

	it("should capture a tokenized gateway payment method auth", async () => {
		const createGatewayPaymentMethodRequest = getBasicTokenizeGatewayPaymentMethodRequest({
			customerId: "CAPTURECUSTOMER1",
		});

		const gatewayPaymentMethodResponse = await client.paymentMethods.tokenizeGatewayPaymentMethod(createGatewayPaymentMethodRequest);
		expect(gatewayPaymentMethodResponse.responseCode, "Gateway Payment Method approved").toEqual(ResponseCode.Approved);

		const authRequest:AuthorizeTokenizedPaymentMethodRequest = {
			amount: 1000,
			currencyCode: "USD",
			merchantTransactionId: generateUniqueMerchantTransactionId(),
			orderId: "O112233",
			paymentMethodId: gatewayPaymentMethodResponse.paymentMethod.paymentMethodId,
			retryCount: 3,
			customerId: gatewayPaymentMethodResponse.customerId,
			gatewayToken: GATEWAY_TOKEN,
		};
		const authResponse = await client.authorize.authorizeTokenizedPaymentMethod(authRequest);

		expect(authResponse.responseCode, "Authorize tokenized gateway payment method approved").toEqual(ResponseCode.Approved);

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

		const requestOptions = {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		};
		const result = await client.capture.capture(authResponse.transactionId, requestOptions);

		let expectedResponse:any = EmptyObjectBuilder.captureResponse();
		expectedResponse =
		{
			...expectedResponse,
			currencyCode: authResponse.currencyCode,
			amount: authResponse.amount,
			transactionStatus: TransactionStatus.Approved,
			responseCode: ResponseCode.Approved,
			merchantTransactionId: requestOptions.merchantTransactionId,
			disableCustomerRecovery: authRequest.disableCustomerRecovery ?? false,
			merchantAccountReferenceId: expect.any(String),
			response: {
				...expectedResponse.response,
				avsCode: AvsResponseCode.AvsNotSupported,
				cvvCode: CvvResponseCode.Match
			},
			paymentMethod: {
				...expectedResponse.paymentMethod,
				...authResponse.paymentMethod,
				dateCreated: expect.any(Date),
			}
		};

		expect(result, "Tokenized Gateway Auth then Capture response should match expected values").toEqual(expectedResponse);
	});
})

describe("Void", () => {
	it("should void a credit card charge", async () => {
		const chargeRequest = getBasicChargeRequest();
		const chargeResponse = await client.charge.chargeCreditCard(chargeRequest);
		expect(chargeResponse.responseCode, "Credit Card Charge should be created").toEqual(ResponseCode.Approved);

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

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
		const authRequest = getBasicCreditCardAuthRequest();
		const authResponse = await client.authorize.authorizeCreditCard(authRequest);
		expect(authResponse.responseCode, "Credit Card Auth should be approved").toEqual(ResponseCode.Approved);

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

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

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

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

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

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

		await sleep(POST_TRANSACTION_WAIT_TIME_SEC);	// The system requires a wait time before the new transaction is visible while the system synchronizes

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
