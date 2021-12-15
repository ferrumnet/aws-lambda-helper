"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTokenParser = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const HttpRequestProcessor_1 = require("../http/HttpRequestProcessor");
const EcdsaAuthProvider_1 = require("./EcdsaAuthProvider");
const HmacAuthProvider_1 = require("./HmacAuthProvider");
class AuthTokenParser {
    constructor(uniBack, hmacApiKeyStore) {
        this.uniBack = uniBack;
        this.hmacApiKeyStore = hmacApiKeyStore;
    }
    __name__() {
        return "AuthTokenParser";
    }
    authTokens(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = request.headers;
            const token = headers.authorization || headers.Authorization || "";
            const authType = HttpRequestProcessor_1.HttpRequestProcessor.authType(token);
            // Get extra auth data
            if (authType === "hmac") {
                const auth = new HmacAuthProvider_1.HmacAuthProvider("", // TODO: use the url to avoid cross-service
                request.body, 0, undefined, undefined, pub => this.hmacApiKeyStore.publicToSecret(pub));
                const [valid, reason] = yield auth.isValidAsync(request.headers);
                ferrum_plumbing_1.ValidationUtils.isTrue(valid, "Authentication failed: " + reason);
                return {
                    authType,
                    hmacPublicKey: auth.getAuthSession(),
                };
            }
            if (authType === "ecdsa") {
                const auth = new EcdsaAuthProvider_1.EcdsaAuthProvider("", // TODO: use the url to avoid cross-service
                request.body, undefined, undefined, (a) => __awaiter(this, void 0, void 0, function* () { return true; }));
                const [valid, reason] = yield auth.isValidAsync(request.headers);
                ferrum_plumbing_1.ValidationUtils.isTrue(valid, "Authentication failed: " + reason);
                return {
                    authType,
                    ecdsaAddress: auth.getAuthSession(),
                };
            }
            if (authType === "json") {
                const userId = this.uniBack.signInUsingToken(token.split(' ')[1]);
                return { authType, userId };
            }
            return {
                authType,
            };
        });
    }
}
exports.AuthTokenParser = AuthTokenParser;
//# sourceMappingURL=AuthTokenParser.js.map