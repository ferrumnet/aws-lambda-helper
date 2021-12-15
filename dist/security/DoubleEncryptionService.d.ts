import { EncryptedData, HexString, Injectable } from "ferrum-plumbing";
import { KmsCryptor } from "../aws/KmsCryptor";
import { TwoFaEncryptionClient } from "./TwoFaEncryptionClient";
export declare class DoubleEncryptiedSecret implements Injectable {
    private ksmCryptor;
    private twoFaCryptor;
    private _secret;
    constructor(ksmCryptor: KmsCryptor, twoFaCryptor: TwoFaEncryptionClient);
    __name__(): string;
    init(twoFaId: string, twoFa: string, data: EncryptedData): Promise<void>;
    encrypt(twoFaId: string, twoFa: string, clearText: HexString): Promise<EncryptedData>;
    secret(): HexString;
}
//# sourceMappingURL=DoubleEncryptionService.d.ts.map