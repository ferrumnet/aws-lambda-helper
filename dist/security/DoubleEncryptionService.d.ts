import { HexString, Injectable } from "ferrum-plumbing";
import { KmsCryptor } from "../aws/KmsCryptor";
import { TwoFaEncryptionClient } from "./TwoFaEncryptionClient";
export declare class DoubleEncryptiedSecret implements Injectable {
    private ksmCryptor;
    private twoFaCryptor;
    private _secret;
    constructor(ksmCryptor: KmsCryptor, twoFaCryptor: TwoFaEncryptionClient);
    __name__(): string;
    init(twoFaId: string, twoFa: string, dataStr: string): Promise<void>;
    encrypt(twoFaId: string, twoFa: string, clearText: HexString): Promise<string>;
    secret(): HexString;
}
//# sourceMappingURL=DoubleEncryptionService.d.ts.map