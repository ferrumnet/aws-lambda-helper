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
exports.LambdaGlobalModule = void 0;
const HandlerFactory_1 = require("./HandlerFactory");
const LambdaGlobalContext_1 = require("./LambdaGlobalContext");
const LambdaConfig_1 = require("./LambdaConfig");
const aws_sdk_1 = require("aws-sdk");
const ferrum_plumbing_1 = require("ferrum-plumbing");
const Types_1 = require("./aws/Types");
class LambdaGlobalModule {
    configAsync(container) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const region = process.env.REGION || LambdaConfig_1.LambdaConfig.DefaultRegion;
            const secretManager = new aws_sdk_1.SecretsManager({ region });
            const config = new LambdaConfig_1.LambdaConfig(secretManager);
            yield config.init();
            (0, ferrum_plumbing_1.makeInjectable)('SQS', aws_sdk_1.SQS);
            (0, ferrum_plumbing_1.makeInjectable)('KMS', aws_sdk_1.KMS);
            container.register(aws_sdk_1.SQS, () => new aws_sdk_1.SQS({ region: process.env[Types_1.AwsEnvs.AWS_DEFAULT_REGION] }));
            (0, ferrum_plumbing_1.makeInjectable)('SNS', aws_sdk_1.SNS);
            (0, ferrum_plumbing_1.makeInjectable)('CloudWatch', aws_sdk_1.CloudWatch);
            container.register(aws_sdk_1.SNS, () => new aws_sdk_1.SNS({ region: process.env[Types_1.AwsEnvs.AWS_DEFAULT_REGION] }));
            container.register(aws_sdk_1.KMS, () => new aws_sdk_1.KMS({ region: process.env[Types_1.AwsEnvs.AWS_DEFAULT_REGION] }));
            container.register(aws_sdk_1.CloudWatch, () => new aws_sdk_1.CloudWatch({ region: process.env[Types_1.AwsEnvs.AWS_DEFAULT_REGION] }));
            container.register(LambdaConfig_1.LambdaConfig, () => config);
            container.registerLifecycleParent(HandlerFactory_1.HandlerFactory, c => new HandlerFactory_1.HandlerFactory(c.get('LambdaSqsHandler'), c.get('LambdaHttpHandler')));
            container.register(LambdaGlobalContext_1.LambdaGlobalContext, c => new LambdaGlobalContext_1.LambdaGlobalContext(c.get(HandlerFactory_1.HandlerFactory)));
        });
    }
}
exports.LambdaGlobalModule = LambdaGlobalModule;
//# sourceMappingURL=LambdaGlobalModule.js.map