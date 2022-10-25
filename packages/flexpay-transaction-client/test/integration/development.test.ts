// import { FlexPayTransactionClient, ResponseCode, sandbox, SortOrder } from "../../src";
// import { consoleJson } from "../test-helper";
// jest.setTimeout(300000);	// 5 minutes
// let authorizationToken:string;

// beforeAll(() => {
// 	authorizationToken = process.env["X_FP_AUTH_TOKEN"] as string;
// });


// beforeEach(() => {
// 	jest.resetAllMocks();
// 	jest.restoreAllMocks();
// });

// it("General API test", async () => {
// 	const client = new FlexPayTransactionClient({
// 		authorizationToken: authorizationToken,
// 		debugOutput: true,
// 	});

// 	const response = await client.paymentMethods.createCreditCardPaymentMethod({
// 		customerId: "basic test customer",
// 		creditCard: {
// 			creditCardNumber: sandbox.creditCards.visa.creditCardNumber,
// 			expiryMonth: sandbox.creditCards.visa.expiryMonth,
// 			expiryYear: sandbox.creditCards.visa.expiryYear,
// 			cvv: sandbox.creditCards.visa.cvv,
// 			firstName: "John",
// 			lastName: "Doe",
// 			fullName: null,
// 			address1: "",
// 			address2: null,
// 			postalCode: "",
// 			city: "",
// 			state: "",
// 			country: "",
// 			email: null,
// 			phoneNumber: null,
// 		},
// 	});
// 	expect(response.responseCode, "Credit Card Payment Method approved").toEqual(ResponseCode.Approved);

// 	const paymentMethodId = response.paymentMethod.paymentMethodId;

// 	const recacheResponse = await client.paymentMethods.recacheCvv(paymentMethodId, "123");
// 	expect(recacheResponse.responseCode).toEqual(ResponseCode.Approved);


// });
