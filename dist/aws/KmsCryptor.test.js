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
const KmsCryptor_1 = require("./KmsCryptor");
const aws_sdk_1 = require("aws-sdk");
test('encrypt data', function () {
    return __awaiter(this, void 0, void 0, function* () {
        jest.setTimeout(100000);
        const cryptor = new KmsCryptor_1.KmsCryptor(new aws_sdk_1.KMS({ region: 'us-east-2' }), 'arn:aws:kms:us-east-2:181310517868:key/5600dedc-7db1-4b7e-9f64-022efb53d6f1');
        const data = Buffer.from('Some text', 'utf-8').toString('hex');
        const enc = yield cryptor.encryptHex(data);
        expect(enc.data.length).toBe(64);
        const decrypted = yield cryptor.decryptToHex(enc);
        const clean = Buffer.from(decrypted, 'hex').toString('utf-8');
        expect(clean).toBe('Some text');
    });
});
test('random hex', function () {
    return __awaiter(this, void 0, void 0, function* () {
        jest.setTimeout(100000);
        const cryptor = new KmsCryptor_1.KmsCryptor(new aws_sdk_1.KMS({ region: 'us-east-2' }), 'arn:aws:kms:us-east-2:181310517868:key/5600dedc-7db1-4b7e-9f64-022efb53d6f1');
        const sk = yield cryptor.randomHex();
        console.log('Random hex: ', sk);
        expect(sk).toBeTruthy();
    });
});
//# sourceMappingURL=KmsCryptor.test.js.map