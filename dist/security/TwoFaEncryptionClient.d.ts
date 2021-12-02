import { WebNativeCryptor } from "ferrum-crypto";
import { EncryptedData, HexString, Injectable, LoggerFactory } from "ferrum-plumbing";
export declare class TwoFaEncryptionClient implements Injectable {
    private cyptor;
    private uri;
    private apiSecret;
    private apiPub;
    private queryServerTimestamp;
    private fetcher;
    constructor(cyptor: WebNativeCryptor, uri: string, logFac: LoggerFactory, apiSecret: string, apiPub: string, queryServerTimestamp: boolean);
    __name__(): string;
    encrypt(twoFaId: string, twoFa: string, data: HexString): Promise<EncryptedData>;
    newKey(): Promise<{
        keyId: string;
        secret: string;
    }>;
    decrypt(twoFaId: string, twoFa: string, data: EncryptedData): Promise<HexString>;
    serverTimestamp(): Promise<number>;
    private getTwoFaWrapperKey;
}
//# sourceMappingURL=TwoFaEncryptionClient.d.ts.map