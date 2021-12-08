import { WebNativeCryptor } from "ferrum-crypto";
import { EncryptedData, Injectable, ValidationUtils } from "ferrum-plumbing";
import { MongooseConnection } from "../dataLayer/mongoose/MongooseConnector";
import { Connection, Document, Model, Schema } from "mongoose";

export interface ApiKeyStorage {
	accessKey: string;
	secretKey: EncryptedData;
}

const apiKeyStorageSchema = new Schema<ApiKeyStorage&Document>({
	accessKey: String,
	secretKey: Object,
});

const ApiKeyModel = (c: Connection) =>
	c.model<ApiKeyStorage&Document>('apiKeys', apiKeyStorageSchema);

export class HmacApiKeyStore extends MongooseConnection implements Injectable {
	private model: Model<ApiKeyStorage&Document> | undefined;
	private con: Connection|undefined;
	constructor(
		private cryptor: WebNativeCryptor,
	) {
		super();
	}

	__name__() { return 'HmacApiKeyStore'; }

	initModels(c: Connection) {
		this.con = c;
		this.model = ApiKeyModel(c);
	}

	async registerKey(accessKey: string, secretKey: string) {
		ValidationUtils.isTrue(!!accessKey, '"accessKey" is required');
		ValidationUtils.isTrue(!!secretKey, '"secretKey" is requried');
		const data = {
			accessKey,
			secretKey: await this.cryptor.encryptHex(secretKey),
		} as ApiKeyStorage;
		await new this.model!(data).save();
	}

	async publicToSecret(accessKey: string): Promise<string> {
		ValidationUtils.isTrue(!!accessKey, '"accessKey" is requried');
		this.verifyInit();

		const data = (await this.model!.findOne({accessKey})) as ApiKeyStorage;
		ValidationUtils.isTrue(!!data, 'Api access key not found');
		return this.cryptor.decryptToHex(data.secretKey);
	}

	async close() {
		if (this.con) {
			await this.con!.close();
		}
	}
}