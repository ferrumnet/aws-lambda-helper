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
const ferrum_plumbing_1 = require("ferrum-plumbing");
const MongooseConnector_1 = require("../dataLayer/mongoose/MongooseConnector");
const mongoose_1 = require("mongoose");
const apiKeyStorageSchema = new mongoose_1.Schema({
    accessKey: String,
    secretKey: Object,
});
const ApiKeyModel = (c) => c.model('apiKeys', apiKeyStorageSchema);
class HmacApiKeyStore extends MongooseConnector_1.MongooseConnection {
    constructor(cryptor) {
        super();
        this.cryptor = cryptor;
    }
    __name__() { return 'HmacApiKeyStore'; }
    initModels(c) {
        this.con = c;
        this.model = ApiKeyModel(c);
    }
    registerKey(accessKey, secretKey) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!accessKey, '"accessKey" is required');
            ferrum_plumbing_1.ValidationUtils.isTrue(!!secretKey, '"secretKey" is requried');
            const data = {
                accessKey,
                secretKey: yield this.cryptor.encryptHex(secretKey),
            };
            yield new this.model(data).save();
        });
    }
    publicToSecret(accessKey) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!accessKey, '"accessKey" is requried');
            this.verifyInit();
            const data = (yield this.model.findOne({ accessKey }));
            ferrum_plumbing_1.ValidationUtils.isTrue(!!data, 'Api access key not found');
            return this.cryptor.decryptToHex(data.secretKey);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.con) {
                yield this.con.close();
            }
        });
    }
}
exports.HmacApiKeyStore = HmacApiKeyStore;
//# sourceMappingURL=HmacApiKeyStore.js.map