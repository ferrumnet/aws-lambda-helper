"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestProcessor = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
class HttpRequestProcessor {
    constructor() {
        this.processor = {};
        this.processorAuth = {};
    }
    registerProcessor(command, fun) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!this.processorAuth[command] && !this.processor[command], `Command '${command}' already registered`);
        this.processor[command] = fun;
    }
    registerProcessorAuth(command, fun) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!this.processorAuth[command] && !this.processor[command], `Command '${command}' already registered`);
        this.processorAuth[command] = fun;
    }
    for(command) {
        return this.processor[command];
    }
    forAuth(command) {
        return this.processorAuth[command];
    }
    static authType(token) {
        if (!token) {
            return "none";
        }
        if (token.startsWith("hmac/")) {
            return "hmac";
        }
        if (token.startsWith("ecdsa/")) {
            return "ecdsa";
        }
        if (token.toLowerCase().startsWith("bearer ")) {
            return "json";
        }
        return "none";
    }
}
exports.HttpRequestProcessor = HttpRequestProcessor;
//# sourceMappingURL=HttpRequestProcessor.js.map