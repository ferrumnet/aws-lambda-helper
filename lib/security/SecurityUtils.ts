
const TIMEOUT_MILLIS_BACK = 24 * 3600 * 1000;
const TIMEOUT_MILLIS_FUTURE = 10 * 1000; // Allow for 10 min time sync error

export class SecurityUtils {
    static timestampInRange(t: string | number) {
        const n = Number(t);
        if (!Number.isFinite(n)) { return false; }
        const now = Date.now();
        return n > now - TIMEOUT_MILLIS_BACK && n < now + TIMEOUT_MILLIS_FUTURE;
    }
}