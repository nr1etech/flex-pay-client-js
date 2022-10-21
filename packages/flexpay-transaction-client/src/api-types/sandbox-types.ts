import { AvsResponseCode, CardType, CvvResponseCode, ResponseCode, TransactionType } from "./enum-types";

export interface SandboxCreditCards {
	visa: SandboxCreditCardValues;
	masterCard: SandboxCreditCardValues;
	amex: SandboxCreditCardValues;
	dinersClub: SandboxCreditCardValues;
	jcb: SandboxCreditCardValues;
	discover: SandboxCreditCardValues;
}

interface SandboxCreditCardValues {
	creditCardNumber: string;
	expiryMonth: string;
	expiryYear: string;
	cvv: string;
	cardType: CardType;
}

export const sandboxCreditCards:Readonly<SandboxCreditCards> = Object.freeze({
	visa: {
		creditCardNumber: "4920201996449560",
		expiryMonth: "07",
		expiryYear: "2024",
		cvv: "879",
		cardType: CardType.Visa,
	},
	masterCard: {
		creditCardNumber: "5244209084665514",
		expiryMonth: "07",
		expiryYear: "2024",
		cvv: "010",
		cardType: CardType.MasterCard,
	},
	amex: {
		creditCardNumber: "341674949684898",
		expiryMonth: "07",
		expiryYear: "2024",
		cvv: "1000",
		cardType: CardType.AmericanExpress,
	},
	dinersClub: {
		creditCardNumber: "30349475125576",
		expiryMonth: "06",
		expiryYear: "2024",
		cvv: "100",
		cardType: CardType.DinersClub,
	},
	jcb: {
		creditCardNumber: "3530111333300000",
		expiryMonth: "06",
		expiryYear: "2024",
		cvv: "100",
		cardType: CardType.Jcb,
	},
	discover: {
		creditCardNumber: "6011885753412897",
		expiryMonth: "06",
		expiryYear: "2024",
		cvv: "100",
		cardType: CardType.Discover,
	},
});

export interface SandboxResponses {
	softDeclineReferToCardIssuer: SandboxResponseAmount;
	softDeclineDoNotHonor: SandboxResponseAmount;
	softDeclineInsufficientFunds: SandboxResponseAmount;
	hardDeclineInvalidTransaction: SandboxResponseAmount;
	riskBlockedTransaction: SandboxResponseAmount;
	apiValidationError: SandboxResponseAmount;
}

interface SandboxResponseAmount {
	amount: number;
	responseCode: ResponseCode;
}

const sandboxResponseCodeAmounts:Readonly<SandboxResponses> = Object.freeze({
	softDeclineReferToCardIssuer: {
		amount: 2005,
		responseCode: ResponseCode.SoftDeclineReferToCardIssuer,
	},
	softDeclineDoNotHonor: {
		amount: 2008,
		responseCode: ResponseCode.SoftDeclineDoNotHonor,
	},
	softDeclineInsufficientFunds: {
		amount: 2012,
		responseCode: ResponseCode.SoftDeclineInsufficientFunds,
	},
	hardDeclineInvalidTransaction: {
		amount: 3016,
		responseCode: ResponseCode.HardDeclineInvalidTransaction,
	},
	riskBlockedTransaction: {
		amount: 4018,
		responseCode: ResponseCode.RiskBlockedTransaction,
	},
	apiValidationError: {
		amount: 5023,
		responseCode: ResponseCode.ApiValidationError,
	},
});

export interface SandboxAvs {
	zipCodeDoesNotMatch: SandboxAvsCheckAddress1;
	unsupportedIndustry: SandboxAvsCheckAddress1;
	addressDoesNotMatch: SandboxAvsCheckAddress1;
	avsNotSupported: SandboxAvsCheckAddress1;
	nineDigitMatch: SandboxAvsCheckAddress1;
	fiveDigitMatch: SandboxAvsCheckAddress1;
}
interface SandboxAvsCheckAddress1 {
	address1: string;
	avsResponseCode: AvsResponseCode;
}

const sandboxAvsCheckAddress1:Readonly<SandboxAvs> = Object.freeze({
	zipCodeDoesNotMatch: {
		address1: "Street_A",
		avsResponseCode: AvsResponseCode.ZipCodeDoesNotMatch,
	},
	unsupportedIndustry: {
		address1: "Street_E",
		avsResponseCode: AvsResponseCode.UnsupportedIndustry,
	},
	addressDoesNotMatch: {
		address1: "Street_N",
		avsResponseCode: AvsResponseCode.AddressDoesNotMatch,
	},
	avsNotSupported: {
		address1: "Street_S",
		avsResponseCode: AvsResponseCode.AvsNotSupported,
	},
	nineDigitMatch: {
		address1: "Street_X",
		avsResponseCode: AvsResponseCode.NineDigitMatch,
	},
	fiveDigitMatch: {
		address1: "Street_Y",
		avsResponseCode: AvsResponseCode.FiveDigitMatch,
	},
});

export interface SandboxCvv {
	issuerNotCertified: SandboxCvvValue;
	mismatch: SandboxCvvValue;
	match: SandboxCvvValue;
	noResults: SandboxCvvValue;
	notProcessed: SandboxCvvValue;
	shouldBePresent: SandboxCvvValue;
}

interface SandboxCvvValue {
	cvv: string;
	cvvResponseCode: CvvResponseCode;
	responseCode: ResponseCode;
}

const sandboxCvvCode:Readonly<SandboxCvv> = Object.freeze({
	issuerNotCertified: {
		cvv: "201",
		cvvResponseCode: CvvResponseCode.IssuerNotCertified,
		responseCode: ResponseCode.HardDeclineCvvFailure,
	},
	mismatch: {
		cvv: "202",
		cvvResponseCode: CvvResponseCode.Mismatch,
		responseCode: ResponseCode.RiskDeclinedAvs,
	},
	match: {
		cvv: "203",
		cvvResponseCode: CvvResponseCode.Match,
		responseCode: ResponseCode.Approved,
	},
	noResults: {
		cvv: "204",
		cvvResponseCode: CvvResponseCode.NoResults,
		responseCode: ResponseCode.HardDeclineCvvFailure,
	},
	notProcessed: {
		cvv: "205",
		cvvResponseCode: CvvResponseCode.NotProcessed,
		responseCode: ResponseCode.HardDeclineCvvFailure,
	},
	shouldBePresent: {
		cvv: "206",
		cvvResponseCode: CvvResponseCode.ShouldBePresent,
		responseCode: ResponseCode.RiskGatewayCvvIncorrect,
	},
});

export interface Recovery {
	approved: RecoveryAmount;
	retry: RecoveryAmount;
	noRetry: RecoveryAmount;
}

interface RecoveryAmount {
	amount: number;
	disableCustomerRecovery: boolean;
	responseCode: ResponseCode;
}

const sandboxRecovery:Readonly<Recovery> = Object.freeze({
	approved: {
		amount: 6020,
		disableCustomerRecovery: true,
		responseCode: ResponseCode.Approved,
	},
	retry: {
		amount: 6020,
		disableCustomerRecovery: false,
		responseCode: ResponseCode.SoftDeclineReferToCardIssuer,
	},
	noRetry: {
		amount: 7028,
		disableCustomerRecovery: true,
		responseCode: ResponseCode.HardDeclineNoRetryReferToIssuer,
	},
});

export interface VoidRefund {
	scenario1: VoidRefundScenario1;
	scenario2: VoidRefundScenario2;
	scenario3: VoidRefundScenario3;
}

interface VoidRefundScenario1 {
	step1Charge: VoidRefundAmount;
	step2FailedVoid: VoidRefundAmount;
	step3Refund: VoidRefundAmount;
}

interface VoidRefundScenario2 {
	step1Charge: VoidRefundAmount;
	step2Void: VoidRefundAmount;
}

interface VoidRefundScenario3 {
	step1Charge: VoidRefundAmount;
	step2Refund: VoidRefundAmount;
}

interface VoidRefundAmount {
	amount: number;
	transactionType: TransactionType;
	responseCode: ResponseCode;
}

const sandboxVoidRefund:Readonly<VoidRefund> = Object.freeze({
	scenario1: {
		step1Charge: {
			amount: 9000,
			transactionType: TransactionType.Charge,
			responseCode: ResponseCode.Approved,
		},
		step2FailedVoid: {
			amount: 9000,
			transactionType: TransactionType.Void,
			responseCode: ResponseCode.HardDeclineReversalFailed,
		},
		step3Refund: {
			amount: 9000,
			transactionType: TransactionType.Refund,
			responseCode: ResponseCode.Approved,
		},
	},
	scenario2: {
		step1Charge: {
			amount: 7514,
			transactionType: TransactionType.Charge,
			responseCode: ResponseCode.Approved,
		},
		step2Void: {
			amount: 7514,
			transactionType: TransactionType.Void,
			responseCode: ResponseCode.Approved,
		},
	},
	scenario3: {
		step1Charge: {
			amount: 9001,
			transactionType: TransactionType.Charge,
			responseCode: ResponseCode.Approved,
		},
		step2Refund: {
			amount: 9001,
			transactionType: TransactionType.Refund,
			responseCode: ResponseCode.Approved,
		},
	},
});


export interface PartialRefund {
	scenario1: PartialRefundScenario1;
	scenario2: PartialRefundScenario2;
	scenario3: PartialRefundScenario3;
}

interface PartialRefundScenario1 {
	step1Charge: VoidRefundAmount;
	step2Refund: VoidRefundAmount;
}

interface PartialRefundScenario2 {
	step1Charge: VoidRefundAmount;
	step2PartialRefund: VoidRefundAmount;
	step3PartialRefund: VoidRefundAmount;
}

interface PartialRefundScenario3 {
	step1Charge: VoidRefundAmount;
	step2FailedRefund: VoidRefundAmount;
}

const sandboxPartialRefund:Readonly<PartialRefund> = Object.freeze({
	scenario1: {
		step1Charge: {
			amount: 9000,
			transactionType: TransactionType.Charge,
			responseCode: ResponseCode.Approved,
		},
		step2Refund: {
			amount: 0,
			transactionType: TransactionType.Refund,
			responseCode: ResponseCode.Approved,
		},
	},
	scenario2: {
		step1Charge: {
			amount: 7500,
			transactionType: TransactionType.Charge,
			responseCode: ResponseCode.Approved,
		},
		step2PartialRefund: {
			amount: 4000,
			transactionType: TransactionType.Void,
			responseCode: ResponseCode.Approved,
		},
		step3PartialRefund: {
			amount: 3500,
			transactionType: TransactionType.Void,
			responseCode: ResponseCode.Approved,
		},
	},
	scenario3: {
		step1Charge: {
			amount: 5000,
			transactionType: TransactionType.Charge,
			responseCode: ResponseCode.Approved,
		},
		step2FailedRefund: {
			amount: 5500,
			transactionType: TransactionType.Refund,
			responseCode: ResponseCode.HardDeclineInvalidAmount,
		},
	},
});

export const sandbox = Object.freeze({
	creditCards: sandboxCreditCards,
	responseCodes: sandboxResponseCodeAmounts,
	avs: sandboxAvsCheckAddress1,
	cvv: sandboxCvvCode,
	recovery: sandboxRecovery,
	refund: sandboxVoidRefund,
	partialRefund: sandboxPartialRefund,
});
