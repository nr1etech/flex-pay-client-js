export enum TransactionStatus {
	Approved = 1,
	Thing2 = 2,
}

export enum TransactionType {
	Authorize = "Authorize",
	Charge = "Charge",
	Capture = "Capture",
	CreateGatewayPaymentMethod = "CreateGatewayPaymentMethod",
	Void = "Void",
	Refund = "Refund",
}

export enum PaymentMethodType {
	CreditCard = "CreditCard",
	GatewayPaymentMethodId = "GatewayPaymentMethodId",
}

export enum GatewayType {
	"usa_epay" = "usa_epay",
	"checkout_v2" = "checkout_v2",
	"test" = "test",
}

export enum CardType {
	AmericanExpress = "AMERICAN EXPRESS",
	Visa = "VISA",
}

export enum StorageState {
	Stored = "Stored",
	Cachedd = "Cached",
}

export enum PaymentModel {
	OneTime = "onetime",
	Subscription = "subscription",
	Installment = "installment",
}

export enum AvsResponseCode {
	ZipCodeDoesNotMatch = "A",
	UnsupportedIndustry = "E",
	AddressDoesNotMatch = "N",
	AvsNotSupported = "S",
	NineDigitMatch = "X",
	FiveDigitMatch = "Y",
}

export enum CvvResponseCode {
	IssuerNotCertified = "U",
	Mismatch = "N",
	Match = "M",
	NoResults = "Q",
	NotProcessed = "P",
	ShouldBePresent = "S",
}

export enum ResponseCode {
	// Success
	Approved = "10000",
	ReversalSuccess = "10001",

	// Soft Decline
	SoftDeclineReferToCardIssuer = "20000",
	SoftDeclineInvalidMerchant = "20002",
	SoftDeclineDoNotHonor = "20003",
	SoftDeclineReenterTransaction = "20012",
	SoftDeclineInvalidResponses = "20013",
	SoftDeclineCompletedPartially = "20018",
	SoftDeclineBankDecline = "20022",
	SoftDeclineInsufficientFunds = "20023",
	SoftDeclineResponseTimeout = "20039",
	SoftDeclineTransactionIncomplete = "20043",
	SoftDeclineSystemError = "20046",
	SoftDeclineOther = "20047",
	SoftDeclineUnableToAuthorize = "20048",
	SoftDeclineOverDailyLimit = "20050",
	SoftDeclineCustomerTokenInvalid = "20056",
	SoftDeclineMerchantAccountAuthFailed = "20057",
	SoftDeclineInvalidApiToken = "20068",
	SoftDeclineBatchInvalid = "20073",
	SoftDeclineSuspectedFraud = "20074",
	SoftDeclineMerchantTransactionLimitExceeded = "20075",
	SoftDeclineTransactionDataInvalid = "20076",
	SoftDeclineNotCreditAccount = "20077",
	SoftDeclineNotChequeAccount = "20078",
	SoftDeclineNotSavingsAccount = "20079",
	SoftDeclineExpiredCard = "20080",
	SoftDeclineLimitExceeded = "20081",
	SoftDeclineInvalidTransactionDate = "20082",
	SoftDeclineInvalidExpiryDateFormat = "20083",
	SoftDeclineUnsupportedCardType = "20084",
	SoftDeclineGatewayDeclinedInvalidTransaction = "20085",
	SoftDeclineBillingAddressMissing = "20086",
	SoftDeclineGatewayDeclinedBlacklist = "20087",
	SoftDeclineGatewayDeclinePostalCodeInvalid = "20088",
	SoftDeclineGatewayDeclinedMissingData = "20089",
	SoftDeclineDeclinedAvsPaymentMethodd = "20090",
	SoftDeclineShippingCountryMismatch = "20091",
	SoftDeclineShippingBinMismatch = "20092",
	SoftDeclineShippingIpMismatch = "20093",
	SoftDeclineBillingBinMismatch = "20094",
	SoftDeclineBillingIpMismatch = "20095",
	SoftDeclineGatewayDeclineCardNumberBlacklisted = "20097",
	SoftDeclineGatewayDeclineIpAddressBlacklisted = "20098",
	SoftDeclineGatewayDeclineEmailBlacklisted = "20099",
	SoftDeclineGatewayPhoneNumberBlacklisted = "20100",
	SoftDeclineRetrieveCardCallBank = "20101",
	SoftDeclineExpiredCardPickup = "20102",
	SoftDeclineInvalidCardNumber = "20103",
	SoftDeclineNoGatewayForCardType = "20104",

	// Hard Decline
	HardDeclineRetrieveCardCallBank = "30000",
	HardDeclineLostOrStolen = "30001",
	HardDeclineLuhnCheckFailed = "30002",
	HardDeclineExpiredCardPickup = "30003",
	HardDeclineSuspectedFraudPickup = "30004",
	HardDeclineRestrictedCardPickup = "30006",
	HardDeclineLostCard = "30008",
	HardDeclineStolenCard = "30009",
	HardDeclineVoidFailed = "30010",
	HardDeclineInvalidTransaction = "30011",
	HardDeclineInvalidCardNumber = "30012",
	HardDeclineReversalFailed = "30013",
	HardDeclineInvalidAmount = "30015",
	HardDeclineInvalidParameters = "30016",
	HardDeclineFormatError = "30017",
	HardDeclineNotCreditAccount = "30019",
	HardDeclineNotChequeAccount = "30024",
	HardDeclineNotSavingsAccount = "30025",
	HardDeclineExpiredCard = "30026",
	HardDeclineTransactionNotPermitted = "30029",
	HardDeclineSuspectedFraud = "30031",
	HardDeclineRestrictedCard = "30034",
	HardDeclineDuplicateTransaction = "30044",
	HardDeclineCvvFailure = "30049",
	HardDeclineLimitExceeded = "300051",
	HardDeclineInvalidTransactionDate = "300052",
	HardDeclineCardNotSupported = "30053",
	HardDeclineInvalidExpiryDateFormat = "30055",
	HardDeclineUnsupportedCardType = "30058",
	HardDeclineGatewayInvalidTransaction = "30059",
	HardDeclineInvalidCurrency = "30061",
	HardDeclineBillingAddressMissing = "30062",
	HardDeclineAuthorizationAlreadyReversedOrCaptureLargerThanAuthorized = "30064",
	HardDeclineAuthorizationCompleted = "30065",
	HardDeclineTransactionAlreadyReversed = "30066",
	HardDeclineInvalidApiVersion = "30071",
	HardDeclineInvalidUser = "30074",
	HardDeclinePartialReversalNotAllowed = "30077",
	HardDeclineOriginalTransactionNotFound = "30078",
	HardDeclineAlreadyCaptured = "30079",
	HardDeclineNoRetryReferToIssuer = "30080",
	HardDeclineNoRetryInvalidMerchant = "30081",
	HardDeclineNoRetryDoNotHonour = "30082",
	HardDeclineNoRetryTransactionExpired = "30083",
	HardDeclineNoRetryInvalidResponse = "30084",
	HardDeclineNoRetryCompletedPartially = "30085",
	HardDeclineNoRetryBankDecline = "30086",
	HardDeclineNoRetryInsufficientFunds = "30087",
	HardDeclineNoRetryResponseTimeout = "30088",
	HardDeclineNoRetryTransactionIncompleted = "30089",
	HardDeclineNoRetrySystemError = "30090",
	HardDeclineNoRetryUnidentifiedResponses = "30091",
	HardDeclineNoRetryOverDailyLimit = "30092",
	HardDeclineNoRetryCustomerTokenInvalid1 = "30093",
	HardDeclineNoRetryCustomerTokenInvalid2 = "30094",
	HardDeclineNoRetryMerchantAccountAuthFailed = "30095",
	HardDeclineNoRetryInvalidApiAccessToken = "30096",
	HardDeclineNoRetryBatchInvalid = "30097",
	HardDeclineNoRetryMerchantTransactionLimitExceeded = "30098",
	HardDeclineNoRetryRequiredDataInvalid = "30099",
	HardDeclineNoRetryRetryLimitReached = "30100",
	HardDeclineInvalidGatewayPaymentMethod = "30101",
	HardDeclineNoRetrySuspectedFraud = "30102",

	// Risk Responses
	RiskBlockedTransaction = "40000",
	RiskGatewayBlacklistTransaction = "40002",
	RiskGatewayCvvIncorrect = "40003",
	RiskGatewayPostalCodeInvalid = "40004",
	RiskGatewayMissingRequiredData = "40005",
	RiskDeclinedAvs = "40006",
	RiskMismatchShippingCountry = "40007",
	RiskMismatchShippingBinCountry = "40008",
	RiskMismatchShippingIpcountry = "40009",
	RiskMismatchBillingBinCountry = "40010",
	RiskMismatchBillingIpCountry = "40011",
	RiskMismatchBinIpCountry = "40012",
	RiskGatewayCardNumberBlacklisted = "40030",
	RiskGatewayIpBlacklisted = "40031",
	RiskGatewayEmailBlacklisted = "40032",
	RiskGatewayPhoneNumber = "40033",

	// API Validation
	ApiValidationError = "50000",
	ApiParsingError = "50002",
	ApiNoParameters = "50003",
	ApiAuthorizationDenied = "50005",
	ApiInvalidCustomerTokenLength = "50014",
	ApiInvalidEmailLength = "50015",
	ApiInvalidPhonenumberLength = "50020",
	ApiInvalidFullnameLength = "50028",
	ApiInvalidStateCodeLength = "50029",
	ApiInvalidCustomerIpLength = "50037",
	ApiInvalidCountrycode = "50039",
	ApiCurrencyCodeRequired = "50045",
	ApiCustomerTokenOrEmailAreRequired = "50048",
	ApiMonthRequired = "50055",
	ApiInvalidMonth = "50056",
	ApiYearRequired = "50057",
	ApiInvalidYear = "50058",
	ApiCreditCardNumberRequired = "50059",
	ApiInvalidCreditCardNumberLength = "50060",
	ApiInvalidMerchantDescriptorLength = "50068",
	ApiInvalidCurrencyCodeLength = "50073",
	ApiFirstnameRequired = "50088",
	ApiLastnameRequired = "50089",
	ApiFullnameOrFirstLastRequired = "50090",
	ApiInvalidFirstnameLength = "50091",
	ApiInvalidLastnameLength = "50092",
	ApiCountryCodeRequired = "50093",
	ApiPostalCodeRequired = "50094",
	ApiInvalidPostalCodeLength = "50095",
	ApiStatecodeRequired = "50096",
	ApiCityRequired = "50097",
	ApiInvalidCityLength = "50098",
	ApiAddress1Required = "50099",
	ApiInvalidAddress1Length = "50100",
	ApiMerchantTransactionReferenceIdRequired = "50103",
	ApiInvalidMerchantTransactionReferenceIdLength = "50104",
	ApiInvalidTransactionType = "50105",
	ApiInvalidCustomField1Length = "50106",
	ApiInvalidCustomField2Length = "50107",
	ApiInvalidCustomField3Length = "50108",
	ApiInvalidCustomField4Length = "50109",
	ApiInvalidCustomField5Length = "50110",
	ApiInvalidReferenceDataLength = "50111",
	ApiInvalidShippingPhoneNumberLength = "50112",
	ApiInvalidShippingCountryCodeLength = "50113",
	ApiInvalidShippingPostalCodeLength = "50114",
	ApiInvalidShippingStateCodeLength = "50115",
	ApiInvalidShippingCityLength = "50116",
	ApiInvalidShippingAddress2Length = "50117",
	ApiInvalidShippingAddress1Length = "50118",
	ApiInvalidAddress2Length = "50119",
	ApiInvalidBillingPlanCodeLength = "50120",
	ApiInvalidProductCategoryNameLength = "50121",
	ApiInvalidProductSkuLength = "50122",
	ApiInvalidMerchantLocationLength = "50123",
	ApiInvalidDescriptionLength = "50124",
	ApiInvalidGatewayTransactionTokenLength = "50125",
	ApiOrderIdRequired = "50126",
	ApiInvalidOrderIdLength = "50127",
	ApiInvalidGatewayTokenLength = "50128",
	ApiMerchantTransactionReferenceIdNotUnique = "50129",
	ApiNoGatewayForCardType = "50130",
	ApiOriginalTransactionNotFound = "50131",
	ApiInvalidReferenceData = "50132",
	ApiPaymentTokenRequired = "50133",
	ApiInvalidValueForPaymentToken = "50134",
	ApiPaymentTokenOrPaymentMethodRequired = "50135",
	ApiInvalidPaymentMethod = "50136",
	ApiInvalidAmount = "50137",
	ApiInvalidGatewayPaymentMethodId = "50138",
	ApiInvalidGatewayPaymentMethodIdLength = "50139",
	ApiInvalidMerchantAccountReferenceId = "50140",
	ApiInvalidMerchantAccountReferenceIdLength = "50141",
	ApiInvalidVendorIdLength = "50142",
	ApiInvalidGatewayReferenceId = "50143",
	ApiInvalidGatewayReferenceIdLength = "50144",
	ApiInvalidGatewayType = "50145",
	ApiInconsistentReferenceId = "50146",
	ApiInvalidCurrencyGateway = "50147",
	ApiInvalidCurrencyMerchantAccount = "50148",
	ApiInvalidGatewayPaymentMethodIdForGateway = "50149",
	ApiInvalidGatewayTransactionId = "50150",
	ApiInvalidGatewayTransactionIdLength = "50151",
	ApiGatewayTransactionIdOnlyForAuthOrCharge = "50152",
	ApiInvalidLast4DigitsLength = "50153",
	ApiInvalidFirst6DigitsLength = "50154",
	ApiInvalidPaymentModel = "50155",
	ApiInvalidAccountState = "50156",
}
