import { EncryptedData, HexString } from "ferrum-plumbing";
export declare class SecurityUtils {
    static timestampInRange(t: string | number): boolean;
    static encryptedDataToString(d: EncryptedData): HexString;
    static encryptedDataFromString(s: HexString): EncryptedData;
}
//# sourceMappingURL=SecurityUtils.d.ts.map