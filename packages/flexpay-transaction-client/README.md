# FlexPay Transaction API Javascript Client by NetRadius


## Installation

`npm install @netradius/flexpay-transaction-client`

## Usage

```typescript
import { FlexPayTransactionClient } from "@netradius/flexpay-transaction-client";

let baseUrl = "https://api.....";

const client = new FlexPayTransactionClient(baseUrl, {
	authorizationToken: "abcd-1234",
});

const userInfo = await client.getInfo();
```
