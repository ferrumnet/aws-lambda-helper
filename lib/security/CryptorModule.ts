import { CryptoJsKeyProvider, WebNativeCryptor } from 'ferrum-crypto';
import { Container, LoggerFactory, Module } from 'ferrum-plumbing';
import { KmsCryptor } from '../aws/KmsCryptor';
import { DoubleEncryptiedSecret } from './DoubleEncryptionService';
import { TwoFaEncryptionClient } from './TwoFaEncryptionClient';

export class CryptorModule implements Module {
	constructor(
		private twoFaApiUri: string,
		private twoFaApiSecret: string,
		private twoFaApiAccess: string,
		private kmsKeyArn: string,
	) {}

    async configAsync(c: Container): Promise<void> {
		c.register(KmsCryptor, c => new KmsCryptor(c.get('KMS'), this.kmsKeyArn));
		c.register(DoubleEncryptiedSecret, c => new DoubleEncryptiedSecret(c.get(KmsCryptor), c.get(TwoFaEncryptionClient)));
		c.register(TwoFaEncryptionClient, c => new TwoFaEncryptionClient(
			c.get(WebNativeCryptor),
			this.twoFaApiUri,
			c.get(LoggerFactory),
			this.twoFaApiSecret,
			this.twoFaApiAccess,
			false,
		 ));
		c.register(WebNativeCryptor, c => new WebNativeCryptor(c.get(CryptoJsKeyProvider)));
		c.register(CryptoJsKeyProvider, c => new CryptoJsKeyProvider());
    }
}