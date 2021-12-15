"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityUtils = void 0;
const TIMEOUT_MILLIS_BACK = 24 * 3600 * 1000;
const TIMEOUT_MILLIS_FUTURE = 10 * 1000; // Allow for 10 min time sync error
class SecurityUtils {
    static timestampInRange(t) {
        const n = Number(t);
        if (!Number.isFinite(n)) {
            return false;
        }
        const now = Date.now();
        return n > now - TIMEOUT_MILLIS_BACK && n < now + TIMEOUT_MILLIS_FUTURE;
    }
}
exports.SecurityUtils = SecurityUtils;
//# sourceMappingURL=SecurityUtils.js.map