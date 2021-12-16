import { HexString, Injectable, ValidationUtils } from "ferrum-plumbing";
import { KmsCryptor } from "../aws/KmsCryptor";
import { SecurityUtils } from "./SecurityUtils";
import { TwoFaEncryptionClient } from "./TwoFaEncryptionClient";

export class DoubleEncryptiedSecret implements Injectable {
	private _secret: string = '';
	constructor(
		private ksmCryptor: KmsCryptor,
		private twoFaCryptor: TwoFaEncryptionClient,
	) {
	}

	__name__() { return 'DoubleEncryptionService'; }

	async init(twoFaId: string, twoFa: string, dataStr: string) {
		const data = SecurityUtils.encryptedDataFromString(dataStr);
		const unwrap1 = await this.twoFaCryptor.decrypt(twoFaId, twoFa, data);
		const sk = SecurityUtils.encryptedDataFromString(unwrap1);
		ValidationUtils.isTrue(!!sk.key && !!sk.data, 'Could not decrypt data with twoFa');
		this._secret = await this.ksmCryptor.decryptToHex(sk);
		ValidationUtils.isTrue(!!this._secret, 'Could not decrypt data with KMS');
	}

	async encrypt(twoFaId: string, twoFa: string, clearText: HexString): Promise<string> {
		const secret1 = await this.ksmCryptor.encryptHex(clearText);
		const msg = SecurityUtils.encryptedDataToString(secret1);
		return SecurityUtils.encryptedDataToString(await this.twoFaCryptor.encrypt(twoFaId, twoFa, msg));
	}

	secret(): HexString {
		ValidationUtils.isTrue(!!this._secret, 'secret is not initialzied');
		return this._secret;
	}
}