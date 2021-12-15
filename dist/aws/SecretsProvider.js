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
exports.SecretsProvider = void 0;
const aws_sdk_1 = require("aws-sdk");
const ferrum_plumbing_1 = require("ferrum-plumbing");
class SecretsProvider {
    constructor(region, secretArn) {
        this.region = region;
        this.secretArn = secretArn;
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = new aws_sdk_1.SecretsManager({ region: this.region });
            const res = yield manager.getSecretValue({
                SecretId: this.secretArn,
            }).promise();
            ferrum_plumbing_1.ValidationUtils.isTrue(!!res.SecretString, 'Secret is empty');
            return JSON.parse(res.SecretString);
        });
    }
    randomPassword(len) {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = new aws_sdk_1.SecretsManager({ region: this.region });
            const res = yield manager.getRandomPassword({
                PasswordLength: len,
            }).promise();
            return res.RandomPassword;
        });
    }
}
exports.SecretsProvider = SecretsProvider;
//# sourceMappingURL=SecretsProvider.js.map