import { FlexPayTransactionClient, SortOrder } from "../../src";
import { consoleJson } from "../test-helper";
jest.setTimeout(300000);	// 5 minutes
let authorizationToken:string;

beforeAll(() => {
	authorizationToken = process.env["X_FP_AUTH_TOKEN"] as string;
});


beforeEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

it("General API test", async () => {
	const client = new FlexPayTransactionClient({
		authorizationToken: authorizationToken,
		debugOutput: true,
	});

	// const result = await client.paymentMethods.getPaymentMethodList(null, 20, SortOrder.Descending);
	// consoleJson(result);

	const result = await client.paymentMethods.getPaymentMethod("I2ADGPVQQ7SE3G5IAGB6NMYRCI");
	consoleJson(result);

});
