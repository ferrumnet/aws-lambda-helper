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
exports.UnifyreBackendProxyService = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UnifyreBackendProxyService {
    constructor(unifyreKitFactory, jwtRandomKey) {
        this.unifyreKitFactory = unifyreKitFactory;
        this.jwtRandomKey = jwtRandomKey;
    }
    __name__() { return 'UnifyreBackendProxyService'; }
    signInToServer(token, expiresIn) {
        return __awaiter(this, void 0, void 0, function* () {
            const uniKit = this.unifyreKitFactory();
            yield uniKit.signInWithToken(token);
            const userProfile = yield uniKit.getUserProfile();
            ferrum_plumbing_1.ValidationUtils.isTrue(!!userProfile, 'Error signing in to unifyre');
            const session = this.newSession(userProfile.userId, expiresIn);
            return [userProfile, session];
        });
    }
    signInUsingToken(jsonToken) {
        const res = jsonwebtoken_1.default.verify(jsonToken, this.jwtRandomKey);
        ferrum_plumbing_1.ValidationUtils.isTrue(!!res || !res.userId, 'Error authenticating using JWT token');
        return res.userId;
    }
    newSession(userId, expiresIn) {
        return jsonwebtoken_1.default.sign({ userId }, this.jwtRandomKey, { expiresIn: expiresIn || '1h' });
    }
}
exports.UnifyreBackendProxyService = UnifyreBackendProxyService;
//# sourceMappingURL=UnifyreBackendProxyService.js.map