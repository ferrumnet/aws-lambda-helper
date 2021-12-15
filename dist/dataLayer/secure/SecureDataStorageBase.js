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
exports.SecureDataStorageBase = exports.secureDataStorageItemSchemaFactory = void 0;
const MongooseConnector_1 = require("../mongoose/MongooseConnector");
const mongoose_1 = require("mongoose");
const ferrum_plumbing_1 = require("ferrum-plumbing");
const ferrum_crypto_1 = require("ferrum-crypto");
function secureDataStorageItemSchemaFactory(unsecSchema) {
    return new mongoose_1.Schema(Object.assign({ key: String, createdAt: Number, lastUpdatedAt: Number, enc: Object }, unsecSchema));
}
exports.secureDataStorageItemSchemaFactory = secureDataStorageItemSchemaFactory;
class SecureDataStorageBase extends MongooseConnector_1.MongooseConnection {
    constructor(cryptor) {
        super();
        this.cryptor = cryptor;
    }
    load(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.get(key);
        });
    }
    save(key, val) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.create(key, {}, val);
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.verifyInit();
            yield this.model.deleteOne({ key }).exec();
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.verifyInit();
            const res = yield this.model.findOne({ key });
            if (!res) {
                return undefined;
            }
            const enc = res.enc;
            const decStr = yield this.cryptor.decryptToHex(enc);
            const unEnc = JSON.parse((0, ferrum_crypto_1.hexToUtf8)(decStr));
            delete res._id;
            res.enc = undefined;
            return Object.assign(Object.assign({}, res), unEnc);
        });
    }
    create(key, unsecureData, secureData) {
        return __awaiter(this, void 0, void 0, function* () {
            const [unsec, encDataHex] = this.validateDataToWrite(key, unsecureData, secureData);
            const encData = yield this.cryptor.encryptHex(encDataHex);
            const data = Object.assign(Object.assign({ key }, unsec), { enc: encData, createdAt: Date.now(), lastUpdatedAt: Date.now() });
            return yield new this.model(data).save();
        });
    }
    update(key, unsecureData, secureData) {
        return __awaiter(this, void 0, void 0, function* () {
            const [unsec, encDataHex] = this.validateDataToWrite(key, unsecureData, secureData);
            const encData = yield this.cryptor.encryptHex(encDataHex);
            const data = Object.assign(Object.assign({ key }, unsec), { enc: encData, lastUpdatedAt: Date.now() });
            return yield new this.model(data).updateOne(data, { key }).exec();
        });
    }
    setModel(m) {
        this.model = m;
    }
    validateDataToWrite(key, unsecureData, secureData) {
        this.verifyInit();
        ferrum_plumbing_1.ValidationUtils.isTrue(!!key, 'Key must be provided');
        ferrum_plumbing_1.ValidationUtils.isTrue(secureData && typeof secureData === 'object', 'Secure data must be an object');
        const unsec = unsecureData ? unsecureData : {};
        ferrum_plumbing_1.ValidationUtils.isTrue(typeof unsec === 'object', 'Unsecure data must be an object');
        const encDataHex = (0, ferrum_crypto_1.utf8ToHex)(JSON.stringify(secureData));
        ferrum_plumbing_1.ValidationUtils.isTrue(!!encDataHex, 'Error serializing secure data');
        return [unsec, encDataHex];
    }
}
exports.SecureDataStorageBase = SecureDataStorageBase;
//# sourceMappingURL=SecureDataStorageBase.js.map