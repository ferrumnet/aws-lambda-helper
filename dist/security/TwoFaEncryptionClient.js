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
exports.TwoFaEncryptionClient = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const HmacAuthProvider_1 = require("./HmacAuthProvider");
const SecurityUtils_1 = require("./SecurityUtils");
class TwoFaEncryptionClient {
    constructor(cyptor, // NOTE: This must be a local cryptor. Do not use KMS or the 2fa key will be ignored
    uri, logFac, apiSecret, apiPub, queryServerTimestamp) {
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
            const wrapperKey = yield this.newTwoFaWrapperKey(twoFaId, twoFa);
            const encrypted = yield this.cyptor.encryptHex(data, wrapperKey.data);
            const wrapDataKeyToData = SecurityUtils_1.SecurityUtils.encryptedDataToString({ key: wrapperKey.dataKeyId, data: encrypted.data });
            return {
                key: encrypted.key,
                data: wrapDataKeyToData,
            };
        });
    }
    newKey() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const req = JSON.stringify({ command: 'newTwoFaPair', data: {}, params: [] });
            const auth = new HmacAuthProvider_1.HmacAuthProvider('', req, yield this.serverTimestamp(), this.apiSecret, this.apiPub);
            const headers = auth.asHeader();
            const res = yield this.fetcher.fetch(this.uri, {
                method: 'POST',
                // mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
                    [headers.key]: headers.value,
                },
            });
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res && !!((_a = res === null || res === void 0 ? void 0 : res.seed) === null || _a === void 0 ? void 0 : _a.userId), `Error calling ${this.uri}. No keyId returned`);
            return { keyId: res.seed.userId, secret: res.seed.secret };
        });
    }
    decrypt(twoFaId, twoFa, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataKey = data.key;
            const unrwapDataKey = SecurityUtils_1.SecurityUtils.encryptedDataFromString(data.data);
            const dataKeyId = unrwapDataKey.key;
            const dataData = unrwapDataKey.data;
            ferrum_plumbing_1.ValidationUtils.isTrue(!!dataData, 'Data does not include key Id');
            const wrapperKey = yield this.getTwoFaWrappedData(twoFaId, twoFa, dataKeyId);
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
    newTwoFaWrapperKey(keyId, twoFa) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = JSON.stringify({ command: 'newTwoFaWrapperKey',
                data: { keyId, twoFa }, params: [] });
            const auth = new HmacAuthProvider_1.HmacAuthProvider('', req, yield this.serverTimestamp(), this.apiSecret, this.apiPub);
            const res = yield this.fetcher.fetch(this.uri, {
                method: 'POST',
                // mode: 'cors',
                body: req,
                headers: Object.assign({ 'Content-Type': 'application/json' }, auth.asHeader()),
            });
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res && !!res.dataKeyId, `Error calling ${this.uri}. No wrapper key returned`);
            return res;
        });
    }
    getTwoFaWrappedData(keyId, twoFa, dataKeyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = JSON.stringify({ command: 'getTwoFaWrappedData',
                data: { keyId, twoFa, dataKeyId }, params: [] });
            const auth = new HmacAuthProvider_1.HmacAuthProvider('', req, yield this.serverTimestamp(), this.apiSecret, this.apiPub);
            const res = yield this.fetcher.fetch(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: Object.assign({ 'Content-Type': 'application/json' }, auth.asHeader()),
            });
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res && !!res.secret, `Error calling ${this.uri}. No wrapper key returned`);
            return res.secret;
        });
    }
}
exports.TwoFaEncryptionClient = TwoFaEncryptionClient;
//# sourceMappingURL=TwoFaEncryptionClient.js.map