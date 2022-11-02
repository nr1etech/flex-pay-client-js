import { FlexPayTransactionClient, sandbox, PaymentModel, ChargeCreditCardRequest } from "../../src";
import { consoleJson, generateUniqueMerchantTransactionId, sleep } from "../test-helper";
jest.setTimeout(300000);	// 5 minutes

const INTER_TRANSACTION_SLEEP_SECONDS = 10;
let GATEWAY_TOKEN:string;
let API_KEY:string;
let client:FlexPayTransactionClient;

beforeAll(() => {
	consoleJson(undefined);	// Just calling this so TS doesn't complain about the import

	GATEWAY_TOKEN = process.env["X_FP_GATEWAY_TOKEN"] as string;
	API_KEY = process.env["X_FP_API_KEY"] as string;
	client = new FlexPayTransactionClient({
		apiKey: API_KEY,
		debugOutput: false,
	});
});

beforeEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
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

describe("Disabling Customer Recovery", () => {
	it("Scenario 1 - Disabled - Approved", async () => {
		const chargeRequest = getBasicChargeRequest();
		chargeRequest.amount = sandbox.recovery.approved.amount;
		chargeRequest.disableCustomerRecovery = sandbox.recovery.approved.disableCustomerRecovery;

		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction.responseCode, "Credit Card Charge should be created").toEqual(sandbox.recovery.approved.responseCode);
	});

	it("Scenario 2 - Enabled - Refer to Card Issuer", async () => {
		const chargeRequest = getBasicChargeRequest();
		chargeRequest.amount = sandbox.recovery.retry.amount;
		chargeRequest.disableCustomerRecovery = sandbox.recovery.retry.disableCustomerRecovery;

		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction.responseCode, "Credit Card Charge should be declined").toEqual(sandbox.recovery.retry.responseCode);
	});

	it("Scenario 3 - Disabled - Hard Decline", async () => {
		const chargeRequest = getBasicChargeRequest();
		chargeRequest.amount = sandbox.recovery.noRetry.amount;
		chargeRequest.disableCustomerRecovery = sandbox.recovery.noRetry.disableCustomerRecovery;

		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction.responseCode, "Credit Card Charge should be hard declined").toEqual(sandbox.recovery.noRetry.responseCode);
	});

});

describe("Void and Refund", () => {
	it("Scenario 1 - Void fails, Refund succeeds", async () => {
		const chargeRequest = getBasicChargeRequest();
		chargeRequest.amount = sandbox.refund.scenario1.step1Charge.amount;

		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction.responseCode, "Credit Card Charge should be approved").toEqual(sandbox.refund.scenario1.step1Charge.responseCode);

		await sleep(INTER_TRANSACTION_SLEEP_SECONDS);

		const voidResult = await client.void.void(transaction.transactionId, {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		});
		expect(voidResult.responseCode, "Void should fail").toEqual(sandbox.refund.scenario1.step2FailedVoid.responseCode);

		const refundResult = await client.refund.refund(transaction.transactionId, {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		});
		expect(refundResult.responseCode, "Refund should be approved").toEqual(sandbox.refund.scenario1.step3Refund.responseCode);
	});

	it("Scenario 2 - Void", async () => {
		const chargeRequest = getBasicChargeRequest();
		chargeRequest.amount = sandbox.refund.scenario2.step1Charge.amount;

		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction.responseCode, "Credit Card Charge should be approved").toEqual(sandbox.refund.scenario2.step1Charge.responseCode);

		await sleep(INTER_TRANSACTION_SLEEP_SECONDS);

		const voidResult = await client.void.void(transaction.transactionId, {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		});
		expect(voidResult.responseCode, "Void should be approved").toEqual(sandbox.refund.scenario2.step2Void.responseCode);
	});

	it("Scenario 3 - Refund", async () => {
		const chargeRequest = getBasicChargeRequest();
		chargeRequest.amount = sandbox.refund.scenario3.step1Charge.amount;

		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction.responseCode, "Credit Card Charge should be approved").toEqual(sandbox.refund.scenario3.step1Charge.responseCode);

		await sleep(INTER_TRANSACTION_SLEEP_SECONDS);

		const refundResult = await client.refund.refund(transaction.transactionId, {
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		});
		expect(refundResult.responseCode, "Refund should be approved").toEqual(sandbox.refund.scenario3.step2Refund.responseCode);
	});

});

describe("Partial Refund", () => {
	it("Scenario 1 - Full Refund", async () => {
		const chargeRequest = getBasicChargeRequest();
		chargeRequest.amount = sandbox.partialRefund.scenario1.step1Charge.amount;

		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction.responseCode, "Credit Card Charge should be approved").toEqual(sandbox.partialRefund.scenario1.step1Charge.responseCode);

		await sleep(INTER_TRANSACTION_SLEEP_SECONDS);

		const refundResult = await client.refund.refund(transaction.transactionId, {
			amount: sandbox.partialRefund.scenario1.step2Refund.amount,
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		});
		expect(refundResult.responseCode, "Refund should be approved").toEqual(sandbox.partialRefund.scenario1.step2Refund.responseCode);
	});

	it("Scenario 2 - Partial Refunds - Approved", async () => {
		const chargeRequest = getBasicChargeRequest();
		chargeRequest.amount = sandbox.partialRefund.scenario2.step1Charge.amount;

		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction.responseCode, "Credit Card Charge should be approved").toEqual(sandbox.partialRefund.scenario2.step1Charge.responseCode);

		await sleep(INTER_TRANSACTION_SLEEP_SECONDS);

		const refund1Result = await client.refund.refund(transaction.transactionId, {
			amount: sandbox.partialRefund.scenario2.step2PartialRefund.amount,
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		});
		expect(refund1Result.responseCode, "Partial Refund 1 should be approved").toEqual(sandbox.partialRefund.scenario2.step2PartialRefund.responseCode);

		const refund2Result = await client.refund.refund(transaction.transactionId, {
			amount: sandbox.partialRefund.scenario2.step3PartialRefund.amount,
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		});
		expect(refund2Result.responseCode, "Partial Refund 2 should be approved").toEqual(sandbox.partialRefund.scenario2.step3PartialRefund.responseCode);
	});

	it("Scenario 3 - Refund - Declined", async () => {
		const chargeRequest = getBasicChargeRequest();
		chargeRequest.amount = sandbox.partialRefund.scenario3.step1Charge.amount;

		const transaction = await client.charge.chargeCreditCard(chargeRequest);
		expect(transaction.responseCode, "Credit Card Charge should be approved").toEqual(sandbox.partialRefund.scenario3.step1Charge.responseCode);

		await sleep(INTER_TRANSACTION_SLEEP_SECONDS);

		const refundResult = await client.refund.refund(transaction.transactionId, {
			amount: sandbox.partialRefund.scenario3.step2FailedRefund.amount,
			merchantTransactionId: generateUniqueMerchantTransactionId(),
		});
		expect(refundResult.responseCode, "Partial Refund should be declined").toEqual(sandbox.partialRefund.scenario3.step2FailedRefund.responseCode);
	});

});
