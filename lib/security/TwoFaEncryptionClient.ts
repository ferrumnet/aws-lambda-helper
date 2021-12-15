import { WebNativeCryptor } from "ferrum-crypto";
import { EncryptedData, Fetcher, HexString, Injectable, JsonRpcRequest,
	LoggerFactory, ValidationUtils } from "ferrum-plumbing";
import { HmacAuthProvider } from "./HmacAuthProvider";
import { SecurityUtils } from "./SecurityUtils";

export class TwoFaEncryptionClient implements Injectable {
	private fetcher: Fetcher;
	constructor(
		private cyptor: WebNativeCryptor, // NOTE: This must be a local cryptor. Do not use KMS or the 2fa key will be ignored
		private uri: string,
		logFac: LoggerFactory,
		private apiSecret: string,
		private apiPub: string,
		private queryServerTimestamp: boolean,
	) {
		this.fetcher = new Fetcher(logFac);
	}

	__name__() { return 'TwoFaEncryptionClient'; }

	async encrypt(twoFaId: string, twoFa: string, data: HexString): Promise<EncryptedData> {
		const wrapperKey = await this.newTwoFaWrapperKey(twoFaId, twoFa);
		const encrypted = await this.cyptor.encryptHex(data, wrapperKey.data);
		const wrapDataKeyToData = SecurityUtils.encryptedDataToString({ key: wrapperKey.dataKeyId, data: encrypted.data });
		return {
			key: encrypted.key,
			data: wrapDataKeyToData,
		};
	}

	async newKey(): Promise<{ keyId: string, secret: string }> {
		const req = JSON.stringify({ command: 'newTwoFaPair', data: {}, params: [] } as JsonRpcRequest);
		const auth = new HmacAuthProvider('', req, await this.serverTimestamp(), this.apiSecret, this.apiPub);
		const headers = auth.asHeader();
		const res = await this.fetcher.fetch<{  seed: { userId: string, secret: string, qrCode: string, totpUrl: string, createdAt: number } 
		}>(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
					[headers.key]: headers.value,
                },
            });
		ValidationUtils.isTrue(!!res && !!res?.seed?.userId, `Error calling ${this.uri}. No keyId returned`);
		return { keyId: res.seed.userId, secret: res.seed.secret };
	}

	async decrypt(twoFaId: string, twoFa: string, data: EncryptedData): Promise<HexString> {
		const dataKey = data.key;
		const unrwapDataKey = SecurityUtils.encryptedDataFromString(data.data);
		const dataKeyId = unrwapDataKey.key;
		const dataData = unrwapDataKey.data;
		ValidationUtils.isTrue(!!dataData, 'Data does not include key Id');
		const wrapperKey = await this.getTwoFaWrappedData(twoFaId, twoFa, dataKeyId);
		return this.cyptor.decryptToHex({key: dataKey, data: dataData}, wrapperKey);
	}

	async serverTimestamp(): Promise<number> {
		if (!this.queryServerTimestamp) {
			return Date.now();
		}
		const req = JSON.stringify({ command: 'getServerTimestamp', data: {  }, params: [] } as JsonRpcRequest);
		const res = await this.fetcher.fetch<{wrapperKey: string}>(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
		ValidationUtils.isTrue(!!res, `Error calling ${this.uri}. No timestamp returned`);
		return Number(res);
	}

	private async newTwoFaWrapperKey(keyId: string, twoFa: string): Promise<{ dataKeyId: string, data: string }> {
		const req = JSON.stringify({ command: 'newTwoFaWrapperKey',
			data: { keyId, twoFa }, params: [] } as JsonRpcRequest);
		const auth = new HmacAuthProvider('', req, await this.serverTimestamp(), this.apiSecret, this.apiPub);
		const res = await this.fetcher.fetch<{ dataKeyId: string, data: string }>(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
					...auth.asHeader(),
                },
            });
		ValidationUtils.isTrue(!!res && !!res.dataKeyId, `Error calling ${this.uri}. No wrapper key returned`);
		return res;
	}

	private async getTwoFaWrappedData(keyId: string, twoFa: string, dataKeyId: string): Promise<string> {
		const req = JSON.stringify({ command: 'getTwoFaWrappedData',
			data: { keyId, twoFa, dataKeyId }, params: [] } as JsonRpcRequest);
		const auth = new HmacAuthProvider('', req, await this.serverTimestamp(), this.apiSecret, this.apiPub);
		const res = await this.fetcher.fetch<{secret: string}>(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
					...auth.asHeader(),
                },
            });
		ValidationUtils.isTrue(!!res && !!res.secret, `Error calling ${this.uri}. No wrapper key returned`);
		return res.secret;
	}
}