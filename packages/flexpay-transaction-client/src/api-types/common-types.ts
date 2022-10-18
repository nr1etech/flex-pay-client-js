export interface AddressRequest {
	"address1": string;
	"address2": string|null;
	"postalCode": string;
	"city": string;
	"state": string;
	"country": string;
}

export interface AddressResponse {
	"address1": string | null;
	"address2": string | null;
	"postalCode": string | null;
	"city": string | null;
	"state": string | null;
	"country": string | null;
}
