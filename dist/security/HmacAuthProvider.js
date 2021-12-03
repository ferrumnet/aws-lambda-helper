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
const SecurityUtils_1 = require("./SecurityUtils");
/**
 * Authenticate HMAC or generate the headers. timestamp must be synced with server.
 */
class HmacAuthProvider {
    constructor(url, postData, timestamp, secret, publicKey, publicToSecret) {
        this.url = url;
        this.postData = postData;
        this.timestamp = timestamp;
        this.secret = secret;
        this.publicKey = publicKey;
        this.publicToSecret = publicToSecret;
    }
    asHeader() {
        return { key: 'Authorization', value: `hmac/${this.publicKey}/${this.timestamp}/${this.hash()}`, };
    }
    hash() {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.secret, 'secret is required for hmac');
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.postData, 'postData is required for hmac');
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.timestamp, 'timestamp is required for hmac');
        return ferrum_crypto_1.hmac(this.secret, (this.url || '') + '|' + this.timestamp + '|' + this.postData);
    }
    getAuthSession() {
        return this.publicKey || '';
    }
    isValid(headers) {
        throw new Error('Cannot validate hmac synchronously');
    }
    isValidAsync(headers) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = headers['Authorization'] || headers['authorization'];
            if (!auth) {
                return [false, 'No auth header'];
            }
            const [prefix, pubKey, timestamp, hash] = auth.split('/');
            if (prefix !== 'hmac' || !pubKey || !hash) {
                return [false, 'Not hmac'];
            }
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this.publicToSecret, 'publicToSecret not set');
            if (!SecurityUtils_1.SecurityUtils.timestampInRange(timestamp)) {
                return [false, 'Expired'];
            }
            this.timestamp = Number(timestamp);
            this.secret = yield this.publicToSecret(pubKey);
            if (!this.secret) {
                return [false, 'Invalid key'];
            }
            if (!this.hash() === hash) {
                return [false, 'Wrong hash'];
            }
            return [true, ''];
        });
    }
    verify(headers) {
        throw new Error('Cannot validate hmac synchronously');
    }
    verifyAsync(headers) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(yield this.isValid(headers), 'Unauthorized');
        });
    }
}
exports.HmacAuthProvider = HmacAuthProvider;
//# sourceMappingURL=HmacAuthProvider.js.map