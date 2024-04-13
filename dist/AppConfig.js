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
exports.AppConfig = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const DevConfigUtils_1 = require("./debug/DevConfigUtils");
const Types_1 = require("./aws/Types");
const SecretsProvider_1 = require("./aws/SecretsProvider");
require('dotenv').config();
/**
 * Configuratio for the app.
 * Examples:
 * const c = AppConfig.instance();
 * (await c.fromSecret('CHAIN_CLIENTS')).
 *   .orElse(() => return ({
 *     ETHEREUM: AppConfig.fromEnv('ETHEREUM_ENDPOINT'),
 *   }))
 *   .required<Web3EndpointConfig>(c => ({
 *      'Eth Endpoint required': c.ETHEREUM,
 *   }))
 *   .get<Web3EndpointConfig>();
 */
class AppConfig {
    constructor() {
        this.conf = {};
        this._constants = {};
    }
    static instance() {
        if (!AppConfig._instance) {
            AppConfig._instance = new AppConfig();
        }
        return AppConfig._instance;
    }
    static env(e, def) {
        if (e) {
            return process.env[e] || def;
        }
    }
    static awsRegion() {
        return (process.env.AWS_REGION ||
            process.env[Types_1.AwsEnvs.AWS_DEFAULT_REGION] ||
            "us-east-2");
    }
    get(field) {
        if (field) {
            return this.conf[field];
        }
        return this.conf;
    }
    fromFile(field, path) {
        const conf = (0, DevConfigUtils_1.loadConfigFromFile)(path);
        if (field) {
            this.conf[field] = Object.assign(Object.assign({}, (this.conf[field] || {})), conf);
        }
        else {
            this.conf = Object.assign(Object.assign({}, this.conf), conf);
        }
        return this;
    }
    /**
     * Loads configuration from secret. If secret not configured, it will check the config file.
     */
    fromSecret(field, secretSuffix) {
        return __awaiter(this, void 0, void 0, function* () {
            const region = AppConfig.awsRegion();
            const confArn = process.env[Types_1.AwsEnvs.AWS_SECRET_ARN_PREFIX + secretSuffix];
            const confFilePath = process.env[AppConfig.CONFIG_FILE_PREFIX + secretSuffix];
            if (confArn) {
                const conf = yield new SecretsProvider_1.SecretsProvider(region, confArn).get();
                if (!!field) {
                    this.conf[field] = Object.assign(Object.assign({}, (this.conf[field] || {})), conf);
                }
                else {
                    this.conf = Object.assign(Object.assign({}, this.conf), conf);
                }
            }
            else if (!!confFilePath) {
                this.fromFile(field, confFilePath);
            }
            return this;
        });
    }
    loadConstants(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetcher = new ferrum_plumbing_1.Fetcher(undefined);
            this._constants = (yield fetcher.fetch(path || AppConfig.DEFAULT_CONSTANTS, undefined)) || {};
        });
    }
    constants() {
        return this._constants;
    }
    /**
     * Configs chain providers. By default it expects the providers field in the config
     * file.
     * If the chain config file exists the following environment variables must be provided:
     * CONFIG_FILE_CHAIN_CONFIG="..."
     */
    forChainProviders(field, supportedChains) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.fromSecret(field || 'providers', 'CHAIN_CONFIG'));
        });
    }
    getChainProviders(field) {
        return this.get(field || 'providers');
    }
    orElse(field, setter) {
        const res = setter();
        if (field) {
            this.conf[field] = Object.assign(Object.assign({}, res), (this.conf[field] || {}));
        }
        else {
            this.conf = Object.assign(Object.assign({}, res), this.conf);
        }
        return this;
    }
    set(field, setter) {
        const res = setter();
        if (field) {
            this.conf[field] = Object.assign(Object.assign({}, (this.conf[field] || {})), res);
        }
        else {
            this.conf = Object.assign(Object.assign({}, this.conf), res);
        }
        return this;
    }
    required(field, selector) {
        const res = selector(field ? this.conf[field] : this.conf);
        Object.keys(res).forEach(k => {
            ferrum_plumbing_1.ValidationUtils.isTrue(res[k] !== undefined, k);
        });
        return this;
    }
    chainsRequired(field, chains) {
        return this.required(field || 'providers', c => {
            const rv = {};
            chains.forEach(c => {
                rv[c] = ((field ? this.conf[field] : this.conf['providers']) || {})[c];
            });
            return rv;
        });
    }
}
exports.AppConfig = AppConfig;
AppConfig.DEFAULT_CONSTANTS = 'https://raw.githubusercontent.com/ferrumnet/ferrum-token-list/main/bridge/constants.json';
AppConfig.CONFIG_FILE_PREFIX = 'CONFIG_FILE_';
//# sourceMappingURL=AppConfig.js.map