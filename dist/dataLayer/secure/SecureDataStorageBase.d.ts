import { MongooseConnection } from '../mongoose/MongooseConnector';
import { Document, Model, Schema } from 'mongoose';
import { EncryptedData, JsonStorage } from 'ferrum-plumbing';
import { KmsCryptor } from "../../aws/KmsCryptor";
export interface SecureDataStorageItem {
    key: string;
    createdAt: number;
    lastUpdatedAt: number;
    enc: EncryptedData;
}
export declare function secureDataStorageItemSchemaFactory<T>(unsecSchema: T): Schema<SecureDataStorageItem & T & Document<any, any, any>, Model<SecureDataStorageItem & T & Document<any, any, any>, any, any, any>, any>;
export declare abstract class SecureDataStorageBase<SecT, UnsecT> extends MongooseConnection implements JsonStorage {
    private cryptor;
    private model;
    protected constructor(cryptor: KmsCryptor);
    load(key: string): Promise<any>;
    save(key: string, val: any): Promise<void>;
    remove(key: string): Promise<void>;
    get(key: string): Promise<SecT & UnsecT | undefined>;
    create(key: string, unsecureData: UnsecT, secureData: SecT): Promise<SecureDataStorageItem & UnsecT>;
    update(key: string, unsecureData: UnsecT, secureData: SecT): Promise<SecureDataStorageItem & UnsecT>;
    protected setModel(m: Model<SecureDataStorageItem & UnsecT & Document>): void;
    private validateDataToWrite;
}
//# sourceMappingURL=SecureDataStorageBase.d.ts.map