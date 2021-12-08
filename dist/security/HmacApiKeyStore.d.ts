import { WebNativeCryptor } from "ferrum-crypto";
import { EncryptedData, Injectable } from "ferrum-plumbing";
import { MongooseConnection } from "../dataLayer/mongoose/MongooseConnector";
import { Connection } from "mongoose";
export interface ApiKeyStorage {
    accessKey: string;
    secretKey: EncryptedData;
}
export declare class HmacApiKeyStore extends MongooseConnection implements Injectable {
    private cryptor;
    private model;
    constructor(cryptor: WebNativeCryptor);
    __name__(): string;
    initModels(c: Connection): void;
    registerKey(accessKey: string, secretKey: string): Promise<void>;
    publicToSecret(accessKey: string): Promise<string>;
}
//# sourceMappingURL=HmacApiKeyStore.d.ts.map