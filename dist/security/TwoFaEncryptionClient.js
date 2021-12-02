"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ferrum_crypto_1 = require("ferrum-crypto");
const ferrum_plumbing_1 = require("ferrum-plumbing");
const HmacAuthProvider_1 = require("./HmacAuthProvider");
const DATA_KEY_DELIM = '|**|';
class TwoFaEncryptionClient {
    constructor(cyptor, uri, logFac, apiSecret, apiPub, queryServerTimestamp) {
        this.cyptor = cyptor;
        this.uri = uri;
        this.apiSecret = apiSecret;
        this.apiPub = apiPub;
        this.queryServerTimestamp = queryServerTimestamp;
        this.fetcher = new ferrum_plumbing_1.Fetcher(logFac);
    }
    __name__() { return 'TwoFaEncryptionClient'; }
    encrypt(twoFaId, twoFa, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKeyId = ferrum_crypto_1.randomBytes(32);
            const wrapperKey = yield this.getTwoFaWrapperKey(twoFaId, twoFa, dataKeyId);
            const encrypted = yield this.cyptor.encryptHex(data, wrapperKey);
            return {
                key: encrypted.key,
                data: `${dataKeyId}${DATA_KEY_DELIM}${encrypted.data}`,
            };
        });
    }
    newKey() {
        return __awaiter(this, void 0, void 0, function* () {
            const req = JSON.stringify({ command: 'newTwoFaWrapperKey', data: {}, params: [] });
            const auth = new HmacAuthProvider_1.HmacAuthProvider(req, this.apiSecret, yield this.serverTimestamp(), this.apiPub);
            const res = yield this.fetcher.fetch(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: Object.assign({ 'Content-Type': 'application/json' }, auth.asHeader()),
            });
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res && !!res.keyId, `Error calling ${this.uri}. No keyId returned`);
            return res;
        });
    }
    decrypt(twoFaId, twoFa, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = data.key;
            const [dataKeyId, dataData] = data.data.split(DATA_KEY_DELIM, 2);
            ferrum_plumbing_1.ValidationUtils.isTrue(!!dataData, 'Data does not include key Id');
            const wrapperKey = yield this.getTwoFaWrapperKey(twoFaId, twoFa, dataKeyId);
            return this.cyptor.decryptToHex({ key: dataKey, data: dataData }, wrapperKey);
        });
    }
    serverTimestamp() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.queryServerTimestamp) {
                return Date.now();
            }
            const req = JSON.stringify({ command: 'getServerTimestamp', data: {}, params: [] });
            const res = yield this.fetcher.fetch(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res, `Error calling ${this.uri}. No timestamp returned`);
            return Number(res);
        });
    }
    getTwoFaWrapperKey(keyId, twoFa, dataKeyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = JSON.stringify({ command: 'getTwoFaWrapperKey',
                data: { keyId, twoFa, dataKeyId }, params: [] });
            const auth = new HmacAuthProvider_1.HmacAuthProvider(req, this.apiSecret, yield this.serverTimestamp(), this.apiPub);
            const res = yield this.fetcher.fetch(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: Object.assign({ 'Content-Type': 'application/json' }, auth.asHeader()),
            });
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res && !!res.wrapperKey, `Error calling ${this.uri}. No wrapper key returned`);
            return res.wrapperKey;
        });
    }
}
exports.TwoFaEncryptionClient = TwoFaEncryptionClient;
//# sourceMappingURL=TwoFaEncryptionClient.js.map