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
exports.TestDummyCryptorService = void 0;
const ferrum_crypto_1 = require("ferrum-crypto");
const KmsCryptor_1 = require("../../aws/KmsCryptor");
class TestDummyCryptorService extends KmsCryptor_1.KmsCryptor {
    constructor() {
        super(null, '');
    }
    decryptToHex(enc) {
        return __awaiter(this, void 0, void 0, function* () {
            return enc.data.split(':::')[1];
        });
    }
    encryptHex(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: 'ENC:::' + data,
                key: 'test_key',
            };
        });
    }
    sha256(hexData) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = new Uint8Array(new ArrayBuffer(32));
            return (0, ferrum_crypto_1.arrayBufferToHex)(data);
        });
    }
}
exports.TestDummyCryptorService = TestDummyCryptorService;
//# sourceMappingURL=TestDummyCryptorService.js.map