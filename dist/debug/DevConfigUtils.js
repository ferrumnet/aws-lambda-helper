"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfigFromFile = exports.networkEnvConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const ferrum_plumbing_1 = require("ferrum-plumbing");
function networkEnvConfig(networks, prefix, fun) {
    const rv = {};
    let anyValue = false;
    networks.forEach(net => {
        const env = process.env[prefix + '_' + net] || process.env[prefix + '_DEFAULT'] || '';
        const value = fun(env);
        rv[net] = value;
        anyValue = anyValue || !!value;
    });
    console.log('Network ENV config for ' + prefix + ':', rv);
    return anyValue ? rv : undefined;
}
exports.networkEnvConfig = networkEnvConfig;
function loadConfigFromFile(path) {
    let configFiles = !!path ? [path] : ['/config.json'].concat((process.env.CONFIG_FILES || '').split(','));
    let rv = undefined;
    configFiles.filter(f => fs_1.default.existsSync(f))
        .forEach(f => {
        const conf = JSON.parse(fs_1.default.readFileSync(f).toString('utf-8'));
        rv = Object.assign(Object.assign({}, (rv || {})), conf);
    });
    ferrum_plumbing_1.ValidationUtils.isTrue(!!rv, 'No config file was found. Consider setting CONFIG_FILES env or create ./config.json');
    return rv;
}
exports.loadConfigFromFile = loadConfigFromFile;
//# sourceMappingURL=DevConfigUtils.js.map