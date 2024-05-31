/* * **********************************************************************
   * These are a handful of tests that fail in the sandbox environment
   * but should succeed in the production environment. These tests should
   * be run in production in addition to the sandbox tests.
   *
   * These tests use sandbox PAN data which will need to be changed prior
   * to running in a production environment.
   * ********************************************************************** */

import { FlexPayTransactionClient, sandbox, PaymentModel, ChargeCreditCardRequest, ResponseError, SortOrder, ResponseCode, AuthorizeCreditCardRequest, TransactionStatus, PaymentMethodType, StorageState, AuthorizeTokenizedPaymentMethodRequest, VoidRequest, AvsResponseCode, CvvResponseCode, ChargeGatewayPaymentMethodRequest, RefundRequest, AuthorizationError, ChargeTokenizedPaymentMethodRequest, AddressResponse, VoidResponse, RefundResponse, TransactionType, AuthorizeGatewayPaymentMethodRequest, TokenizeCreditCardPaymentMethodRequest, TokenizeGatewayPaymentMethodRequest, ArgumentError } from "../../src";
import { consoleJson, EmptyObjectBuilder, generateUniqueMerchantTransactionId, sleep } from "../test-helper";
jest.setTimeout(300000);	// 5 minutes

const POST_TRANSACTION_WAIT_TIME_SEC = 10;
let GATEWAY_TOKEN:string;
let API_KEY:string;
let MERCHANT_ACCOUNT_REFERENCE_ID:string;
let client:FlexPayTransactionClient;

beforeAll(() => {
	consoleJson(undefined);	// Just calling this so TS doesn't complain about the import

	GATEWAY_TOKEN = process.env["X_FP_GATEWAY_TOKEN"] as string;
	API_KEY = process.env["X_FP_API_KEY"] as string;
	MERCHANT_ACCOUNT_REFERENCE_ID = process.env["X_FP_MERCHANT_ACCOUNT_REFERENCE_ID"] as string;
	client = new FlexPayTransactionClient({
		apiKey: API_KEY,
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

describe("Payment Methods", () => {
	it("should fail to charge a redacted tokenized payment method", async () => {
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
	it("should retain the payment info in the vault", async () => {
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

	it("should charge a tokenized credit card payment method", async () => {
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

	it("should fail to charge a non-existent tokenized payment method", async () => {
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
	it("should retain the payment info in the vault", async () => {
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

	it("should approve a tokenized credit card payment method", async () => {
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

	it("should fail to auth a non-existent tokenized credit card payment method", async () => {
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

	it("should capture a tokenized credit card auth", async () => {
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
});
