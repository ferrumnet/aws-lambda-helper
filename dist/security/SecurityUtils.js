"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityUtils = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
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
    static encryptedDataToString(d) {
        const len = d.key.length.toString(16);
        ferrum_plumbing_1.ValidationUtils.isTrue(len.length < 16, 'Encrypted data key is way too large');
        const key = len.padStart(16, '0');
        return `${key}${d.key}${d.data}`;
    }
    static encryptedDataFromString(s) {
        const len = Number('0x' + s.substring(0, 16));
        ferrum_plumbing_1.ValidationUtils.isTrue(Number.isFinite(len), 'Invalid data format');
        const key = s.substring(16, len + 16);
        const data = s.substring(len + 16);
        return { key, data };
    }
}
exports.SecurityUtils = SecurityUtils;
//# sourceMappingURL=SecurityUtils.js.map