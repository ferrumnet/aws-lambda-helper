import { Injectable, ValidationUtils } from "ferrum-plumbing";
import { UnifyreBackendProxyService } from "../unifyre/UnifyreBackendProxyService";
import { HttpRequestProcessor } from "../http/HttpRequestProcessor";
import { EcdsaAuthProvider } from "./EcdsaAuthProvider";
import { HmacApiKeyStore } from "./HmacApiKeyStore";
import { HmacAuthProvider } from "./HmacAuthProvider";
import { LambdaHttpRequest } from "../LambdaHttpRequest";

export type AuthenticationTokenType = "json" | "ecdsa" | "hmac" | "none";

export interface AuthTokens {
  authType: AuthenticationTokenType;
  userId?: string;
  hmacPublicKey?: string;
  ecdsaAddress?: string;
}


export class AuthTokenParser implements Injectable {
  constructor(
    private uniBack: UnifyreBackendProxyService,
    private hmacApiKeyStore: HmacApiKeyStore
  ) {}

  __name__(): string {
    return "AuthTokenParser";
  }

  async authTokens(request: LambdaHttpRequest): Promise<AuthTokens> {
    const headers = request.headers as any;
    const token = headers.authorization || headers.Authorization || "";
    const authType = HttpRequestProcessor.authType(token);
    // Get extra auth data
    if (authType === "hmac") {
      const auth = new HmacAuthProvider(
        "", // TODO: use the url to avoid cross-service
        request.body,
        0,
        undefined,
        undefined,
        pub => this.hmacApiKeyStore.publicToSecret(pub),
      );
      const [valid, reason] = await auth.isValidAsync(request.headers);
      ValidationUtils.isTrue(valid, "Authentication failed: " + reason);
      return {
        authType,
        hmacPublicKey: auth.getAuthSession(),
      } as AuthTokens;
    }

    if (authType === "ecdsa") {
      const auth = new EcdsaAuthProvider(
        "", // TODO: use the url to avoid cross-service
        request.body,
        undefined,
        undefined,
        async (a) => true
      );
      const [valid, reason] = await auth.isValidAsync(request.headers);
      ValidationUtils.isTrue(valid, "Authentication failed: " + reason);
      return {
        authType,
        ecdsaAddress: auth.getAuthSession(),
      } as AuthTokens;
    }

    if (authType === "json") {
      const userId = this.uniBack.signInUsingToken(token.split(' ')[1]);
      return { authType, userId } as AuthTokens;
    }

    return {
      authType,
    } as AuthTokens;
  }
}