import { FlexPayTransactionClient, ClientOptions, FetchError, AuthorizationError, ResponseError } from "../../src";
import * as NodeFetch from "node-fetch";

beforeEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe("Client instantiation", () => {
	it("should work with valid options", () => {
		expect(() => {
			new FlexPayTransactionClient({
				baseUrl: "https://example.com",
				authorizationToken: "",
			});
		}).not.toThrow();
	});

	it("should fail with an invalid URL", () => {
		expect(() => {
			new FlexPayTransactionClient({
				baseUrl: "example.com",
				authorizationToken: "",
			});
		}).toThrow();
	});

	it("should fail with missing options", () => {
		expect(() => {
			const options:ClientOptions|undefined = undefined;

			new FlexPayTransactionClient(options!);
		}).toThrow();
	});

	it("should fail with missing authentication option", () => {
		expect(() => {
			const options:ClientOptions = {
				baseUrl: "https://example.com"
			} as ClientOptions;

			new FlexPayTransactionClient(options);
		}).toThrow();
	});

	it("should return the base URL", () => {
		const baseUrl = "https://example.com";
		const authorizationToken = "hello world";

		const client = new FlexPayTransactionClient({
			baseUrl,
			authorizationToken,
		});

		expect(client.getBaseUrl()).toEqual(baseUrl);
	});

	it("should update the authentication", () => {
		const baseUrl = "https://example.com";
		const authorizationToken = "hello world";

		const client = new FlexPayTransactionClient({
			baseUrl,
			authorizationToken,
		});

		expect(() => {
			client.setAuthorizationToken("this is it");
		}).not.toThrow();
	});
});

describe("Client error handling", () => {
	it("should return a FetchError type", async () => {
		const client = new FlexPayTransactionClient({
			authorizationToken: "testauth",
			baseUrl: "https://example.com"
		});

		jest.spyOn(NodeFetch, 'default').mockRejectedValue(new NodeFetch.FetchError("simulated network error", "Network"));

		try {
			await client.transactions.getTransaction("test transactionId");
			expect("Should have thrown").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(FetchError);
			expect((ex as Error).message).toEqual("simulated network error");
		}
	});

	it.each([
		["401 Status", 401],
		["403 Status", 403],
	])
	("should return an AuthorizationError type for %s", async (testName:string, status:number) => {
		const client = new FlexPayTransactionClient({
			authorizationToken: "testauth",
			baseUrl: "https://example.com"
		});

		jest.spyOn(NodeFetch, 'default').mockResolvedValue((() => {
			return {
				ok: false,
				status: status,
				text: async () => "Test content",
			} as unknown as NodeFetch.Response;
		})());

		try {
			await client.transactions.getTransaction("test transactionId");
			expect("Should have thrown").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(AuthorizationError);
			expect((ex as Error).message).toEqual("Authorization Failed");
		}
	});

	it("should return a ResponseError type for 404s", async () => {
		const client = new FlexPayTransactionClient({
			authorizationToken: "testauth",
			baseUrl: "https://example.com"
		});

		jest.spyOn(NodeFetch, 'default').mockResolvedValue((() => {
			return {
				ok: false,
				status: 404,
				text: async () => "Not Found",
			} as unknown as NodeFetch.Response;
		})());

		try {
			await client.transactions.getTransaction("test transactionId");
			expect("Should have thrown").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(ResponseError);
			expect((ex as Error).message).toEqual("Resource not found");
		}
	});

	it("should return a ResponseError type for unexpected content", async () => {
		const client = new FlexPayTransactionClient({
			authorizationToken: "testauth",
			baseUrl: "https://example.com"
		});

		jest.spyOn(NodeFetch, 'default').mockResolvedValue((() => {
			return {
				ok: true,
				status: 200,
				text: async () => "Not Found",
			} as unknown as NodeFetch.Response;
		})());

		try {
			await client.transactions.getTransaction("test transactionId");
			expect("Should have thrown").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(ResponseError);
			expect((ex as Error).message).toEqual("Invalid response content");
		}
	});

	it.each([
		["201 status", 201],
		["301 status", 301],
		["302 status", 302],
		["409 status", 409],
		["500 status", 500],
	])
	("should return a ResponseError for a non-200 status (%s)", async (testName:string, status:number) => {
		const client = new FlexPayTransactionClient({
			authorizationToken: "testauth",
			baseUrl: "https://example.com"
		});

		jest.spyOn(NodeFetch, 'default').mockResolvedValue((() => {
			return {
				ok: false,
				status: status,
				text: async () => "Test content",
			} as unknown as NodeFetch.Response;
		})());

		try {
			await client.transactions.getTransaction("test transactionId");
			expect("Should have thrown").toBeFalsy();
		} catch (ex) {
			expect(ex).toBeInstanceOf(ResponseError);
			expect((ex as Error).message).toEqual("Test content");
		}
	});

	it("should call console.debug when debugOutput is enabled", async () => {
		const client = new FlexPayTransactionClient({
			authorizationToken: "testauth",
			baseUrl: "https://example.com",
			debugOutput: true,
		});

		jest.spyOn(NodeFetch, 'default').mockResolvedValue((() => {
			return {
				ok: true,
				status: 200,
				text: async () => '{ "message": "Test content" }',
			} as unknown as NodeFetch.Response;
		})());

		const consoleSpy = jest.spyOn(console, "debug");

		await client.transactions.getTransaction("test transactionId");
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should not call console.debug when debugOutput is disabled", async () => {
		const client = new FlexPayTransactionClient({
			authorizationToken: "testauth",
			baseUrl: "https://example.com",
		});

		jest.spyOn(NodeFetch, 'default').mockResolvedValue((() => {
			return {
				ok: true,
				status: 200,
				text: async () => '{ "message": "Test content" }',
			} as unknown as NodeFetch.Response;
		})());

		const consoleSpy = jest.spyOn(console, "debug");

		await client.transactions.getTransaction("test transactionId");
		expect(consoleSpy).not.toHaveBeenCalled();
	});

	it("should not call console.log", async () => {
		const client = new FlexPayTransactionClient({
			authorizationToken: "testauth",
			baseUrl: "https://example.com",
			debugOutput: true,
		});

		jest.spyOn(NodeFetch, 'default').mockResolvedValue((() => {
			return {
				ok: true,
				status: 200,
				text: async () => '{ "message": "Test content" }',
			} as unknown as NodeFetch.Response;
		})());

		const consoleSpy = jest.spyOn(console, "log");

		await client.transactions.getTransaction("test transactionId");
		expect(consoleSpy).not.toHaveBeenCalled();
	});

	it("should not call console.info", async () => {
		const client = new FlexPayTransactionClient({
			authorizationToken: "testauth",
			baseUrl: "https://example.com",
			debugOutput: true,
		});

		jest.spyOn(NodeFetch, 'default').mockResolvedValue((() => {
			return {
				ok: true,
				status: 200,
				text: async () => '{ "message": "Test content" }',
			} as unknown as NodeFetch.Response;
		})());

		const consoleSpy = jest.spyOn(console, "info");

		await client.transactions.getTransaction("test transactionId");
		expect(consoleSpy).not.toHaveBeenCalled();
	});

	it.todo("should parse lists with no entity");
	it.todo("should parse lists with an entity");
	it.todo("should parse response witn no entity");
	it.todo("should parse response with an entity");
});
