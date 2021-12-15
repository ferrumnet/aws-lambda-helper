import { randomBytes, WebNativeCryptor } from "ferrum-crypto";
import { EncryptedData, Fetcher, HexString, Injectable, JsonRpcRequest,
	LoggerFactory, ValidationUtils } from "ferrum-plumbing";
import { HmacAuthProvider } from "./HmacAuthProvider";

const DATA_KEY_DELIM = '|**|';

export class TwoFaEncryptionClient implements Injectable {
	private fetcher: Fetcher;
	constructor(
		private cyptor: WebNativeCryptor,
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
		return {
			key: encrypted.key,
			data: `${wrapperKey.dataKeyId}${DATA_KEY_DELIM}${encrypted.data}`,
		};
	}

	async newKey(): Promise<{ keyId: string, secret: string }> {
		const req = JSON.stringify({ command: 'newTwoFaPair', data: {}, params: [] } as JsonRpcRequest);
		const auth = new HmacAuthProvider(req, this.apiSecret, await this.serverTimestamp(), this.apiPub);
		const headers = auth.asHeader();
		const res = await this.fetcher.fetch<{keyId: string, secret: string}>(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
					[headers.key]: headers.value,
                },
            });
		ValidationUtils.isTrue(!!res && !!res.keyId, `Error calling ${this.uri}. No keyId returned`);
		return res;
	}

	async decrypt(twoFaId: string, twoFa: string, data: EncryptedData): Promise<HexString> {
		const dataKey = data.key;
		const [dataKeyId, dataData] = data.data.split(DATA_KEY_DELIM, 2);
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
		const auth = new HmacAuthProvider(req, this.apiSecret, await this.serverTimestamp(), this.apiPub);
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
		const auth = new HmacAuthProvider(req, this.apiSecret, await this.serverTimestamp(), this.apiPub);
		const res = await this.fetcher.fetch<{wrapperKey: string}>(this.uri, {
                method: 'POST',
                mode: 'cors',
                body: req,
                headers: {
                    'Content-Type': 'application/json',
					...auth.asHeader(),
                },
            });
		ValidationUtils.isTrue(!!res && !!res.wrapperKey, `Error calling ${this.uri}. No wrapper key returned`);
		return res.wrapperKey;
	}
}