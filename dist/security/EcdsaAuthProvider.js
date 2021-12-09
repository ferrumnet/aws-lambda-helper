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
 * Authenticate, or create headers for, using ECDSA signature. The authSession is the authenticated address.
 */
class EcdsaAuthProvider {
    constructor(url, postData, timestamp, privateKey, addressValid) {
        this.url = url;
        this.postData = postData;
        this.timestamp = timestamp;
        this.privateKey = privateKey;
        this.addressValid = addressValid;
    }
    asHeader() {
        const sig = this.sign();
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.address, 'EcdsaAuthProvider: No address');
        return { key: 'Authorization', value: `ecdsa/${this.address}/${this.timestamp}/${sig}` };
    }
    hash() {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.postData, 'postData is required for ecdsa hash');
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.timestamp, 'timestamp is required for ecdsa hash');
        return ferrum_crypto_1.sha256sync((this.url || '') + this.timestamp + '|' + this.postData);
    }
    sign() {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.privateKey, 'privateKey is required for signing');
        const h = this.hash();
        const sig = ferrum_crypto_1.Ecdsa.sign(this.privateKey, h);
        this.address = ferrum_crypto_1.Ecdsa.recoverAddress(sig, h);
        return sig;
    }
    getAuthSession() {
        return this.address || '';
    }
    isValid(headers) {
        throw new Error('Cannot validate hmac synchronously');
    }
    isValidAsync(headers) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = headers['Authorization'] || headers['authorization'];
            if (!auth) {
                return [false, 'No authorization header'];
            }
            const [prefix, address, timestamp, sig] = auth.split('/');
            if (prefix !== 'ecdsa' || !timestamp || !sig) {
                return [false, 'Not ecdsa'];
            }
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this.addressValid, 'addressValid not set');
            if (!SecurityUtils_1.SecurityUtils.timestampInRange(timestamp)) {
                return [false, 'Expired'];
            }
            this.timestamp = Number(timestamp);
            const recoveredAddress = ferrum_crypto_1.Ecdsa.recoverAddress(sig, this.hash());
            if (address !== recoveredAddress) {
                return [false, 'Invalid signature'];
            }
            const valid = yield this.addressValid(address);
            if (!valid) {
                return [false, 'Invalid signer'];
            }
            this.address = address;
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
exports.EcdsaAuthProvider = EcdsaAuthProvider;
//# sourceMappingURL=EcdsaAuthProvider.js.map