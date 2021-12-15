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
const utils_1 = require("ts-jest/utils");
const AuthTokenParser_1 = require("./AuthTokenParser");
const ferrum_crypto_1 = require("ferrum-crypto");
const HmacApiKeyStore_1 = require("./HmacApiKeyStore");
const HmacAuthProvider_1 = require("./HmacAuthProvider");
const EcdsaAuthProvider_1 = require("./EcdsaAuthProvider");
jest.mock('aws-lambda-helper/dist/security/HmacApiKeyStore', () => {
    return {
        HmacApiKeyStore: jest.fn().mockImplementation(() => {
            return {
                publicToSecret: (k) => __awaiter(void 0, void 0, void 0, function* () {
                    return 'private-' + k;
                }),
            };
        })
    };
});
test('AuthTokenParser...', () => __awaiter(void 0, void 0, void 0, function* () {
    const apiKeyStore = (0, utils_1.mocked)(HmacApiKeyStore_1.HmacApiKeyStore, true)();
    const pub = 'PUBLIC_KEY';
    const auther = new HmacAuthProvider_1.HmacAuthProvider('', 'MY BODY', Date.now(), 'private-' + pub, pub);
    const headers = auther.asHeader();
    console.log('Header becomes: ', headers);
    const parser = new AuthTokenParser_1.AuthTokenParser({}, apiKeyStore);
    const testReq = {
        body: 'MY BODY',
        headers: {
            [headers.key]: headers.value,
        },
    };
    const tok = yield parser.authTokens(testReq);
    console.log('Token is ', tok);
    expect(tok.hmacPublicKey).toBe(pub);
}));
test('AuthTokenParser with ecdsa...', () => __awaiter(void 0, void 0, void 0, function* () {
    const SK = '0x4b6614c1e982fcf8dcf7f4afe1ce83b13c4d9a66c1c55cdbcab7caf805bbcbfc';
    const pub = ferrum_crypto_1.Ecdsa.publicKey(SK);
    const address = new ferrum_crypto_1.AddressFromPublicKey().forNetwork('ETHEREUM', pub.substring(0, 66), pub).address;
    const auther = new EcdsaAuthProvider_1.EcdsaAuthProvider('', 'MY BODY', Date.now(), SK, (a) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Address was ', a);
        return true;
    }));
    const headers = auther.asHeader();
    console.log('Header becomes: ', headers);
    const parser = new AuthTokenParser_1.AuthTokenParser({}, {});
    const testReq = {
        body: 'MY BODY',
        headers: {
            [headers.key]: headers.value,
        },
    };
    const tok = yield parser.authTokens(testReq);
    console.log('Token is ', tok);
    expect(tok.ecdsaAddress).toBe(address);
    const testReq2 = {
        body: 'MY BODY 2',
        headers: {
            [headers.key]: headers.value,
        },
    };
    try {
        yield parser.authTokens(testReq2);
    }
    catch (e) {
        if (e.toString().indexOf('Authentication failed: Invalid signature') < 0) {
            throw new Error('Unexpected error: ' + e.toString());
        }
    }
}));
//# sourceMappingURL=AuthTokenParser.test.js.map