import { Injectable } from "ferrum-plumbing";
import { UnifyreBackendProxyService } from "../unifyre/UnifyreBackendProxyService";
import { HmacApiKeyStore } from "./HmacApiKeyStore";
import { LambdaHttpRequest } from "../LambdaHttpRequest";
export declare type AuthenticationTokenType = "json" | "ecdsa" | "hmac" | "none";
export interface AuthTokens {
    authType: AuthenticationTokenType;
    userId?: string;
    hmacPublicKey?: string;
    ecdsaAddress?: string;
}
export declare class AuthTokenParser implements Injectable {
    private uniBack;
    private hmacApiKeyStore;
    constructor(uniBack: UnifyreBackendProxyService, hmacApiKeyStore: HmacApiKeyStore);
    __name__(): string;
    authTokens(request: LambdaHttpRequest): Promise<AuthTokens>;
}
//# sourceMappingURL=AuthTokenParser.d.ts.map