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
exports.CryptorModule = void 0;
const ferrum_crypto_1 = require("ferrum-crypto");
const ferrum_plumbing_1 = require("ferrum-plumbing");
const UnifyreBackendProxyService_1 = require("../unifyre/UnifyreBackendProxyService");
const KmsCryptor_1 = require("../aws/KmsCryptor");
const AuthTokenParser_1 = require("./AuthTokenParser");
const DoubleEncryptionService_1 = require("./DoubleEncryptionService");
const HmacApiKeyStore_1 = require("./HmacApiKeyStore");
const TwoFaEncryptionClient_1 = require("./TwoFaEncryptionClient");
class CryptorModule {
    constructor(twoFaApiUri, twoFaApiSecret, twoFaApiAccess, kmsKeyArn) {
        this.twoFaApiUri = twoFaApiUri;
        this.twoFaApiSecret = twoFaApiSecret;
        this.twoFaApiAccess = twoFaApiAccess;
        this.kmsKeyArn = kmsKeyArn;
    }
    configAsync(c) {
        return __awaiter(this, void 0, void 0, function* () {
            c.register(ferrum_plumbing_1.LoggerFactory, () => new ferrum_plumbing_1.LoggerFactory(n => new ferrum_plumbing_1.ConsoleLogger(n)));
            c.register(KmsCryptor_1.KmsCryptor, c => new KmsCryptor_1.KmsCryptor(c.get('KMS'), this.kmsKeyArn));
            c.register(DoubleEncryptionService_1.DoubleEncryptiedSecret, c => new DoubleEncryptionService_1.DoubleEncryptiedSecret(c.get(KmsCryptor_1.KmsCryptor), c.get(TwoFaEncryptionClient_1.TwoFaEncryptionClient)));
            c.register(TwoFaEncryptionClient_1.TwoFaEncryptionClient, c => new TwoFaEncryptionClient_1.TwoFaEncryptionClient(c.get(ferrum_crypto_1.WebNativeCryptor), // Important to not use Kms as KMS will ignore the local keys.
            this.twoFaApiUri, c.get(ferrum_plumbing_1.LoggerFactory), this.twoFaApiSecret, this.twoFaApiAccess, false));
            c.register(ferrum_crypto_1.CryptoJsKeyProvider, c => new ferrum_crypto_1.CryptoJsKeyProvider());
            c.register(ferrum_crypto_1.WebNativeCryptor, c => new ferrum_crypto_1.WebNativeCryptor(c.get(ferrum_crypto_1.CryptoJsKeyProvider)));
            c.register(ferrum_crypto_1.CryptoJsKeyProvider, c => new ferrum_crypto_1.CryptoJsKeyProvider());
            c.register(AuthTokenParser_1.AuthTokenParser, c => new AuthTokenParser_1.AuthTokenParser(c.get(UnifyreBackendProxyService_1.UnifyreBackendProxyService), c.get(HmacApiKeyStore_1.HmacApiKeyStore)));
        });
    }
}
exports.CryptorModule = CryptorModule;
//# sourceMappingURL=CryptorModule.js.map