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
exports.CloudWatchClient = void 0;
class CloudWatchClient {
    constructor(cw, namespace, dimensions) {
        this.cw = cw;
        this.namespace = namespace;
        this.dimensions = dimensions;
        this.namespace = `Ferrum/${namespace}`;
        this.uploadMetrics = this.uploadMetrics.bind(this);
    }
    __name__() { return 'CloudWatchClient'; }
    uploadMetrics(metrics) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!metrics || !metrics.length) {
                return;
            }
            const req = {
                Namespace: this.namespace,
                MetricData: metrics.map(m => ({
                    Dimensions: this.dimensions,
                    MetricName: m.key,
                    Value: m.count,
                    Unit: m.unit,
                })),
            };
            yield this.cw.putMetricData(req).promise();
        });
    }
}
exports.CloudWatchClient = CloudWatchClient;
//# sourceMappingURL=CloudWatchClient.js.map