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
exports.LambdaConfig = void 0;
// tslint:disable:variable-name
// @ts-ignore
const p = process;
class LambdaConfig {
    constructor(secretManager) {
        this.secretManager = secretManager;
        this.secrets = {};
        this.awsRegion = p.env[LambdaConfig.Envs.REGION] || LambdaConfig.DefaultRegion;
        this.custom = p.env[LambdaConfig.Envs.CONFIG_JSON] ?
            JSON.parse(p.env[LambdaConfig.Envs.CONFIG_JSON]) : {};
        this.corsAllow = p.env[LambdaConfig.Envs.CORS_ALLOW];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sqsQueueUrl = p.env[LambdaConfig.Envs.LAMBDA_SQS_QUEUE_URL];
            this.snsErrorArn = p.env[LambdaConfig.Envs.LAMBDA_SNS_ERROR_ARN];
            const secretId = p.env[LambdaConfig.Envs.AWS_SECRET_ARN];
            if (secretId) {
                const secret = yield this.secretManager.getSecretValue({ SecretId: secretId }).promise();
                this.secrets = Object.assign(Object.assign({}, this.secrets), JSON.parse(secret.SecretString));
            }
        });
    }
    __name__() {
        return 'LambdaConfig';
    }
}
exports.LambdaConfig = LambdaConfig;
LambdaConfig.DefaultRegion = 'us-east-1';
LambdaConfig.Keys = {
    FirebaseJson: 'firebase_json',
    FirebaseProjectId: 'firebase_project_id',
    SendGridApiKey: 'send_grid_api_key',
    MongoHost: 'mongo_host',
    MongoDatabase: 'mongo_database',
    MongoPassword: 'mongo_password',
    MongoUser: 'mongo_user',
};
// tslint:disable-next-line:variable-name
LambdaConfig.Envs = {
    LAMBDA_SQS_QUEUE_URL: 'LAMBDA_SQS_QUEUE_URL',
    LAMBDA_SNS_ERROR_ARN: 'LAMBDA_SNS_ERROR_ARN',
    AWS_SECRET_ARN: 'AWS_SECRET_ARN',
    REGION: 'REGION',
    CONFIG_JSON: 'CONFIG_JSON',
    CORS_ALLOW: 'CORS_ALLOW',
};
//# sourceMappingURL=LambdaConfig.js.map