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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulateLamdba = void 0;
const http_1 = __importDefault(require("http"));
class SimulateLamdba {
    static run(port, handler) {
        http_1.default.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { headers, method, url } = req;
            let body = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => __awaiter(this, void 0, void 0, function* () {
                body = Buffer.concat(body).toString();
                res.on('error', (err) => {
                    console.error(err);
                });
                console.log('BODY', body);
                const wrapped = {
                    headers: req.headers,
                    httpMethod: req.httpMethod || req.method || 'POST',
                    body
                };
                const rv = yield handler(wrapped, {});
                res.writeHead(rv.statusCode, rv.headers);
                res.end(rv.body);
            }));
        })).listen(port);
    }
}
exports.SimulateLamdba = SimulateLamdba;
//# sourceMappingURL=SimulateLambda.js.map