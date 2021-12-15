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
exports.TestStorage = exports.TestStorageModel = void 0;
const SecureDataStorageBase_1 = require("./SecureDataStorageBase");
const TestDummyCryptorService_1 = require("./TestDummyCryptorService");
const testDataSchema = (0, SecureDataStorageBase_1.secureDataStorageItemSchemaFactory)({});
const TestStorageModel = (c) => c.model('SsmsData', testDataSchema, 'testSsmsData');
exports.TestStorageModel = TestStorageModel;
class TestStorage extends SecureDataStorageBase_1.SecureDataStorageBase {
    constructor(kms) {
        super(kms);
    }
    initModels(con) {
        super.setModel((0, exports.TestStorageModel)(con));
    }
}
exports.TestStorage = TestStorage;
test('Save an load some data', function () {
    return __awaiter(this, void 0, void 0, function* () {
        jest.setTimeout(1000000);
        const conf = {
            database: process.env.TEST_DATABASE,
            endpoint: process.env.TEST_ENDPOINT,
            user: process.env.TEST_USER,
            pw: process.env.TEST_PW,
        };
        const kms = new TestDummyCryptorService_1.TestDummyCryptorService();
        const storage = new TestStorage(kms);
        yield storage.init(conf);
        const testData = {
            MY_NAME: 'THIS IS MY NAME',
            MY_SECRET: 'SOMETHING SECRET!!!',
        };
        yield storage.save('TEST_KEY', testData);
        const actual = yield storage.load('TEST_KEY');
        expect(actual['MY_NAME']).toBe(testData.MY_NAME);
    });
});
//# sourceMappingURL=SecureDataStorageBase.test.js.map