import { FlexPayTransactionClient, ClientOptions, FetchError, AuthorizationError, ResponseError, TransactionClient, ChargeCreditCardRequest, TOKEN_EX_HEADER } from "../../src";
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
				apiKey: "ABCD",
			});
		}).not.toThrow();
	});

	it("should fail with an invalid URL", () => {
		expect(() => {
			new FlexPayTransactionClient({
				baseUrl: "ftp://example.com",
				apiKey: "ABCD",
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
		const apiKey = "abcd";

		const client = new FlexPayTransactionClient({
			baseUrl,
			apiKey,
		});

		expect(client.getBaseUrl()).toEqual(baseUrl);
	});

	it("should update the authentication", () => {
		const baseUrl = "https://example.com";
		const apiKey = "abcd";

		const client = new FlexPayTransactionClient({
			baseUrl,
			apiKey,
		});

		expect(() => {
			client.setApiKey("ABCD");
		}).not.toThrow();
	});

	it("should fail to update the authentication", () => {
		const baseUrl = "https://example.com";
		const apiKey = "abcd";

		const client = new FlexPayTransactionClient({
			baseUrl,
			apiKey,
		});

		expect(() => {
			client.setApiKey("invalid api key");
		}).toThrow();
	});
});

describe("Client parameters", () => {
	const buildHeaderMatcher = (matchHeaders:Record<string, any>) => {
		return {
			asymmetricMatch: function (headers:NodeFetch.Headers):boolean {
				for (const [name, value] of Object.entries(matchHeaders)) {
					if (!headers.has(name)) {
						return false;
					}

					if (value.asymmetricMatch) {
						return value.asymmetricMatch(headers.get(name));
					} else if (headers.get(name) !== value) {
						return false;
					}
				}

				return true;
			}
		};
	}

	it("should apply TokenEx settings", async () => {
		const client = new FlexPayTransactionClient({
			apiKey: "testauth",
			baseUrl: "https://example.com",
			tokenEx: {
				apiUrl: "https://tokenex.example.com",
				tokenExID : "test-id",
				apiKey: "test-api-key",
			}
		});

		const fetchSpy = jest.spyOn(NodeFetch, 'default').mockResolvedValue({} as NodeFetch.Response);

		try {
			await client.charge.chargeCreditCard({ } as ChargeCreditCardRequest);
		} catch (ex) { }

		expect(fetchSpy).toHaveBeenCalledWith(
			"https://tokenex.example.com",
			expect.objectContaining({
				headers: buildHeaderMatcher({
					[TOKEN_EX_HEADER.TokenExID]: "test-id",
					[TOKEN_EX_HEADER.ApiKey]: "test-api-key",
					[TOKEN_EX_HEADER.URL]: expect.stringContaining("https://example.com"),
				}),
			}),
		);
	});

	it("should not apply TokenEx settings", async () => {
		const client = new FlexPayTransactionClient({
			apiKey: "testauth",
			baseUrl: "https://example.com",
			tokenEx: {
				apiUrl: "https://tokenex.example.com",
				tokenExID : "test-id",
				apiKey: "test-api-key",
			}
		});

		const fetchSpy = jest.spyOn(NodeFetch, 'default').mockResolvedValue({} as NodeFetch.Response);

		try {
			await client.transactions.getTransaction("test");
		} catch (ex) { }

		expect(fetchSpy).toHaveBeenCalledWith(
			expect.stringContaining("https://example.com"),
			expect.objectContaining({
				headers: buildHeaderMatcher({
					"Authorization": expect.any(String),
					"Content-Type": "application/json",
				}),
			}),
		);
	});

	it("should not apply TokenEx settings when no settings are configured", async () => {
		const client = new FlexPayTransactionClient({
			apiKey: "testauth",
			baseUrl: "https://example.com",
		});

		const fetchSpy = jest.spyOn(NodeFetch, 'default').mockResolvedValue({} as NodeFetch.Response);

		try {
			await client.charge.chargeCreditCard({ } as ChargeCreditCardRequest);
		} catch (ex) { }

		expect(fetchSpy).toHaveBeenCalledTimes(1);

		expect(fetchSpy).toHaveBeenCalledWith(
			expect.stringContaining("https://example.com"),
			expect.objectContaining({
				headers: buildHeaderMatcher({
					"Authorization": expect.any(String),
					"Content-Type": "application/json",
				}),
			}),
		);
	});
});

describe("Client error handling", () => {
	it("should return a FetchError type", async () => {
		const client = new FlexPayTransactionClient({
			apiKey: "testauth",
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
			apiKey: "testauth",
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
			apiKey: "testauth",
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
			apiKey: "testauth",
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
			apiKey: "testauth",
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
			apiKey: "testauth",
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
			apiKey: "testauth",
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
			apiKey: "testauth",
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
			apiKey: "testauth",
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

describe("Utility functions", () => {
	it.each([
		"2022-12-01T22:00:00",
		"2022-12-01T22:00:00.0",
		"2022-12-01T22:00:00.00",
		"2022-12-01T22:00:00.000",
		"2022-12-01T22:00:00Z",
		"2022-12-01T22:00:00.000Z",
		"2022-12-01T22:00:00+1011",
		"2022-12-01T22:00:00+10:11",
		"2022-12-01T22:00:00.000+1011",
		"2022-12-01T22:00:00.000+10:11",
		"2022-12-01T22:00:00.0Z",
		"2022-11-01T00:00:00.00",
		"2022-11-01T00:00:00.00Z",
		"2022-11-01T00:00:00.00-1000",
		"2022-12-02T23:00:18.3062179Z",
	])("should convert valid date strings to Date objects [%s]", (testDateString:string) => {
		const client = new TransactionClient({
			apiKey: "testauth",
			baseUrl: "https://example.com",
			debugOutput: true,
		});
		const jsonDateParser = client["jsonDateParser"];

		const result = jsonDateParser("", testDateString);
		expect(result).toBeInstanceOf(Date);

		// If no timezone was in the date string it should have converted it to UTC ("Z")
		if (!/Z|([+-]\d{2}:?\d{2})$/.test(testDateString)) {
			expect((result as Date).toUTCString()).toEqual(new Date(testDateString + "Z").toUTCString());
		}
	});

	it.each([
		"2022-11-01",					// no time component
		"",								// empty
		"Not a date at all",			// not a date at all
		"2022-11-1T0:12:00",			// Day and Hours are not 2 digits
		"00:12:12.000",					// No date part
		"T00:12:12.001",				// No date part
		"2022-11-01T00:00:00.000+100",	// Timezone missing a digit
		"2022-11-01T00:00:00.000-10:0",	// Timezone missing a digit
		"2022-11-01T00:00:00.000-nope",	// Timezone wrong format
		123,
		true,
	])("should not touch properties that are not date strings [%s]", (testValue:unknown) => {
		const client = new TransactionClient({
			apiKey: "testauth",
			baseUrl: "https://example.com",
			debugOutput: true,
		});
		const jsonDateParser = client["jsonDateParser"];

		const result = jsonDateParser("", testValue);
		expect(result).toEqual(testValue);
		expect(typeof result).toEqual(typeof testValue);
	});
});
