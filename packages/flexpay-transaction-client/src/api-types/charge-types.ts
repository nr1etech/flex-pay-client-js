import { BaseCreditCardRequest, BaseTransactionResponse, BaseTokenizedPaymentMethodRequest, BaseGatewayPaymentMethodRequest, GatewayTransactionResponse } from "./common-types";

export interface ChargeCreditCardRequest extends BaseCreditCardRequest { }

export interface ChargeCreditCardResponse extends BaseTransactionResponse { }


export interface ChargeTokenizedPaymentMethodRequest extends BaseTokenizedPaymentMethodRequest { }

export interface ChargeTokenizedPaymentMethodResponse extends BaseTransactionResponse { }


export interface ChargeGatewayPaymentMethodRequest extends BaseGatewayPaymentMethodRequest { }

export interface ChargeGatewayPaymentMethodResponse extends GatewayTransactionResponse { }
