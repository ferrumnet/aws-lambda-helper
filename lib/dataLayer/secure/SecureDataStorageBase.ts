import {MongooseConnection} from '../mongoose/MongooseConnector';
import {Document, Model, Schema} from 'mongoose';
import {EncryptedData, ValidationUtils, JsonStorage} from 'ferrum-plumbing';
import {KmsCryptor} from "../../aws/KmsCryptor";
import {hexToUtf8, utf8ToHex} from "ferrum-crypto";

export interface SecureDataStorageItem {
    key: string;
    createdAt: number;
    lastUpdatedAt: number;
    enc: EncryptedData;
}

export function secureDataStorageItemSchemaFactory<T>(unsecSchema: T) {
    return new Schema<SecureDataStorageItem & T & Document>({
        key: String,
        createdAt: Number,
        lastUpdatedAt: Number,
        enc: { key: String, data: String, },
        ...unsecSchema
    } as any);
}

export abstract class SecureDataStorageBase<SecT, UnsecT> extends MongooseConnection implements JsonStorage {
    private model: Model<SecureDataStorageItem & UnsecT & Document> | undefined;
    protected constructor(private cryptor: KmsCryptor) {
        super();
    }

    async load(key: string): Promise<any> {
        return this.get(key);
    }

    async save(key: string, val: any): Promise<void> {
        await this.create(key, {} as any, val);
    }

    async remove(key: string): Promise<void> {
        this.verifyInit();
        await this.model!.deleteOne({key}).exec();
    }

    async get(key: string): Promise<SecT & UnsecT|undefined> {
        this.verifyInit();
        const res = await this.model!.findOne({key});
        if (!res) {
            return undefined;
        }
        const enc: EncryptedData = res.enc;
        const decStr = await this.cryptor.decryptToHex(enc);
        const unEnc: any = JSON.parse(hexToUtf8(decStr));
        delete res._id;
        res.enc = undefined as any;
        return {
            ...res, ...unEnc,
        } as SecT & UnsecT;
    }

    async create(key: string, unsecureData: UnsecT, secureData: SecT): Promise<SecureDataStorageItem & UnsecT> {
        const [unsec, encDataHex] = this.validateDataToWrite(key, unsecureData, secureData);
        const encData = await this.cryptor.encryptHex(encDataHex);
        const data = {
            key,
            ...unsec,
            enc: encData,
            createdAt: Date.now(),
            lastUpdatedAt: Date.now(),
        } as SecureDataStorageItem & UnsecT;
        return await new this.model!(data).save();
    }

    async update(key: string, unsecureData: UnsecT, secureData: SecT): Promise<SecureDataStorageItem & UnsecT> {
        const [unsec, encDataHex] = this.validateDataToWrite(key, unsecureData, secureData);
        const encData = await this.cryptor.encryptHex(encDataHex);
        const data = {
            key,
            ...unsec,
            enc: encData,
            lastUpdatedAt: Date.now(),
        } as SecureDataStorageItem & UnsecT;
        return await new this.model!(data).updateOne(data, {key}).exec();
    }

    protected setModel(m: Model<SecureDataStorageItem & UnsecT & Document>) {
        this.model = m;
    }

    private validateDataToWrite(key: string, unsecureData: UnsecT, secureData: SecT): [any, string] {
        this.verifyInit();
        ValidationUtils.isTrue(!!key, 'Key must be provided');
        ValidationUtils.isTrue(secureData && typeof secureData === 'object', 'Secure data must be an object');
        const unsec = unsecureData ? unsecureData : {};
        ValidationUtils.isTrue(typeof unsec === 'object', 'Unsecure data must be an object');
        const encDataHex = utf8ToHex(JSON.stringify(secureData));
        ValidationUtils.isTrue(!!encDataHex, 'Error serializing secure data');
        return [unsec, encDataHex];
    }
}
