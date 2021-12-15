"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerFactory = exports.LambdaHttpHandlerHelper = void 0;
function handlePreflight(request) {
    if (request.method === 'OPTIONS' || request.httpMethod === 'OPTIONS') {
        return {
            body: '',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': '*',
            },
            isBase64Encoded: false,
            statusCode: 200,
        };
    }
}
function response(body, code) {
    return {
        body,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "application/json",
        },
        isBase64Encoded: false,
        statusCode: code,
    };
}
class LambdaHttpHandlerHelper {
    static preProcess(request) {
        const preFlight = handlePreflight(request);
        if (preFlight) {
            return { preFlight };
        }
        const headers = request.headers;
        const authToken = (headers.authorization || headers.Authorization || '').split(' ')[1];
        request.path = request.path || request.url;
        return { authToken };
    }
    static ok(body) {
        return response(body, 200);
    }
    static error(e) {
        return response(JSON.stringify({ error: e.toString() }), 501);
    }
    static badRequest() {
        return response('Bad request', 401);
    }
}
exports.LambdaHttpHandlerHelper = LambdaHttpHandlerHelper;
class HandlerFactory {
    constructor(sqsHandler, httpHandler) {
        this.sqsHandler = sqsHandler;
        this.httpHandler = httpHandler;
    }
    get(hType) {
        this.hType = hType;
        return hType === 'http' ? this.httpHandler : this.sqsHandler;
    }
    getLifecycleContext() {
        if (!this.hType) {
            throw new Error('Trying to getLifecycleContext before handling any request');
        }
        const handler = this.hType === 'http' ? this.httpHandler : this.sqsHandler;
        if (handler.lastRequest === undefined) {
            throw new Error(`Trying to getLifecycleContext, while handing ${this.hType} request but handler has` +
                ` no 'lastRequest' field. Make sure your handler implements LastHandledRequest and sets 'lastRequest' in the handle method`);
        }
        return { context: Object.assign(Object.assign({}, handler.lastRequest), { headers: {} }) };
    }
    __name__() {
        return 'HandlerFactory';
    }
}
exports.HandlerFactory = HandlerFactory;
//# sourceMappingURL=HandlerFactory.js.map