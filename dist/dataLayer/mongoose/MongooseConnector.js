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
exports.MongooseConnection = void 0;
const mongoose_1 = require("mongoose");
const ferrum_plumbing_1 = require("ferrum-plumbing");
(0, mongoose_1.set)('useFindAndModify', false);
(0, mongoose_1.set)('useNewUrlParser', true);
(0, mongoose_1.set)('useUnifiedTopology', true);
class MongooseConnection {
    constructor() {
        this.isInit = false;
    }
    init(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const connStr = config.connectionString ||
                `mongodb://${config.user}:${config.pw}@${config.endpoint}/${config.database}`;
            const con = yield (0, mongoose_1.createConnection)(connStr);
            this.initModels(con);
            this.isInit = true;
        });
    }
    verifyInit() {
        ferrum_plumbing_1.ValidationUtils.isTrue(this.isInit, 'Mongoose connection is not initialized');
    }
    __name__() { return 'MongooseConnection'; }
}
exports.MongooseConnection = MongooseConnection;
//# sourceMappingURL=MongooseConnector.js.map