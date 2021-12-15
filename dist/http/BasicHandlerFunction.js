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
exports.BasicHandlerFunction = void 0;
const LambdaGlobalContext_1 = require("../LambdaGlobalContext");
const global = { init: false };
function init(module) {
    return __awaiter(this, void 0, void 0, function* () {
        if (global.init) {
            return LambdaGlobalContext_1.LambdaGlobalContext.container();
        }
        const container = yield LambdaGlobalContext_1.LambdaGlobalContext.container();
        yield container.registerModule(module);
        global.init = true;
        return container;
    });
}
class BasicHandlerFunction {
    constructor(module) {
        this.module = module;
        this.handler = this.handler.bind(this);
    }
    // Once registered this is the handler code for lambda_template
    handler(event, context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const container = yield init(this.module);
                const lgc = container.get(LambdaGlobalContext_1.LambdaGlobalContext);
                return yield lgc.handleAsync(event, context);
            }
            catch (e) {
                console.error(e);
                return {
                    body: e.message,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Accept-Encoding, Accept-Language, Authorization, Host',
                    },
                    isBase64Encoded: false,
                    statusCode: 500,
                };
            }
        });
    }
}
exports.BasicHandlerFunction = BasicHandlerFunction;
//# sourceMappingURL=BasicHandlerFunction.js.map