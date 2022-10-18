export function consoleJson(input:unknown) {
	if (input !== undefined) {
		console.log(JSON.stringify(input, null, 2));
	}
}

export async function sleep(seconds:number) {
	await new Promise(r => setTimeout(r, seconds * 1000));
}

export function generateUniqueMerchantReferenceId() {
	return (new Date()).getTime().toString();
}
