# FlexPay Transaction API Javascript Client by Logicl


## Installation

`npm install @logicl/flexpay-transaction-client`

## Usage

```typescript
import { FlexPayTransactionClient } from "@logicl/flexpay-transaction-client";

const client = new FlexPayTransactionClient({
	baseUrl: "https://api....",
	authorizationToken: "abcd-1234",
});

const transactions = await client.transactions.getTransactionList();
```
