import { BaseCreditCardRequest, BaseTransactionResponse, BaseTokenizedPaymentMethodRequest, BaseGatewayPaymentMethodRequest, GatewayTransactionResponse } from "./common-types";

export interface AuthorizeCreditCardRequest extends BaseCreditCardRequest { }

export interface AuthorizeCreditCardResponse extends BaseTransactionResponse { }


export interface AuthorizeTokenizedPaymentMethodRequest extends BaseTokenizedPaymentMethodRequest { }

export interface AuthorizeTokenizedPaymentMethodResponse extends BaseTransactionResponse { }


export interface AuthorizeGatewayPaymentMethodRequest extends BaseGatewayPaymentMethodRequest { }

export interface AuthorizeGatewayPaymentMethodResponse extends GatewayTransactionResponse { }
