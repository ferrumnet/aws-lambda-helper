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
class KmsCryptor extends ferrum_crypto_1.WebNativeCryptor {
    constructor(kms, cmkKeyId) {
        super({});
        this.kms = kms;
        this.cmkKeyId = cmkKeyId;
    }
    __name__() { return 'KmsCryptor'; }
    decryptKey(key, overrideKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const decKey = yield this.kms.decrypt({
                CiphertextBlob: ferrum_crypto_1.hexToArrayBuffer(key.key),
            }).promise();
            return ferrum_crypto_1.arrayBufferToHex(decKey.Plaintext);
        });
    }
    newKey(overrideKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const encKey = yield this.kms.generateDataKey({ KeyId: this.cmkKeyId, NumberOfBytes: ferrum_crypto_1.Algo.SIZES.KEY_SIZE, }).promise();
            const unEncryptedKey = ferrum_crypto_1.arrayBufferToHex(encKey.Plaintext);
            const encKeyHex = ferrum_crypto_1.arrayBufferToHex(encKey.CiphertextBlob);
            return { encryptedKey: encKeyHex, keyId: this.cmkKeyId, unEncrypedKey: unEncryptedKey };
        });
    }
}
exports.KmsCryptor = KmsCryptor;
//# sourceMappingURL=KmsCryptor.js.map