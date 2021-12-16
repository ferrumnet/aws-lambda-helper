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
exports.DoubleEncryptiedSecret = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const SecurityUtils_1 = require("./SecurityUtils");
class DoubleEncryptiedSecret {
    constructor(ksmCryptor, twoFaCryptor) {
        this.ksmCryptor = ksmCryptor;
        this.twoFaCryptor = twoFaCryptor;
        this._secret = '';
    }
    __name__() { return 'DoubleEncryptionService'; }
    init(twoFaId, twoFa, dataStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = SecurityUtils_1.SecurityUtils.encryptedDataFromString(dataStr);
            const unwrap1 = yield this.twoFaCryptor.decrypt(twoFaId, twoFa, data);
            const sk = SecurityUtils_1.SecurityUtils.encryptedDataFromString(unwrap1);
            ferrum_plumbing_1.ValidationUtils.isTrue(!!sk.key && !!sk.data, 'Could not decrypt data with twoFa');
            this._secret = yield this.ksmCryptor.decryptToHex(sk);
            ferrum_plumbing_1.ValidationUtils.isTrue(!!this._secret, 'Could not decrypt data with KMS');
        });
    }
    encrypt(twoFaId, twoFa, clearText) {
        return __awaiter(this, void 0, void 0, function* () {
            const secret1 = yield this.ksmCryptor.encryptHex(clearText);
            const msg = SecurityUtils_1.SecurityUtils.encryptedDataToString(secret1);
            return SecurityUtils_1.SecurityUtils.encryptedDataToString(yield this.twoFaCryptor.encrypt(twoFaId, twoFa, msg));
        });
    }
    secret() {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this._secret, 'secret is not initialzied');
        return this._secret;
    }
}
exports.DoubleEncryptiedSecret = DoubleEncryptiedSecret;
//# sourceMappingURL=DoubleEncryptionService.js.map