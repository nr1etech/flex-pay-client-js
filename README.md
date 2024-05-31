# FlexPay Client

## Installation

`npm install @nr1e/flex-pay-client`

## Usage

```typescript
import { FlexPayTransactionClient } from "@nr1e/flex-pay-client";

const client = new FlexPayTransactionClient({
	baseUrl: "https://api....",
	authorizationToken: "abcd-1234",
});

const transactions = await client.transactions.getTransactionList();
```
