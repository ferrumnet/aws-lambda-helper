import { CryptoJsKeyProvider, WebNativeCryptor } from 'ferrum-crypto';
import { ConsoleLogger, Container, LoggerFactory, Module } from 'ferrum-plumbing';
import { UnifyreBackendProxyService } from 'lib';
import { KmsCryptor } from '../aws/KmsCryptor';
import { AuthTokenParser } from './AuthTokenParser';
import { DoubleEncryptiedSecret } from './DoubleEncryptionService';
import { HmacApiKeyStore } from './HmacApiKeyStore';
import { TwoFaEncryptionClient } from './TwoFaEncryptionClient';

export class CryptorModule implements Module {
	constructor(
		private twoFaApiUri: string,
		private twoFaApiSecret: string,
		private twoFaApiAccess: string,
		private kmsKeyArn: string,
	) {}

    async configAsync(c: Container): Promise<void> {
		c.register(LoggerFactory, () => new LoggerFactory(n => new ConsoleLogger(n)));
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
		c.register(AuthTokenParser, c => new AuthTokenParser(c.get(UnifyreBackendProxyService),
			c.get(HmacApiKeyStore)));
    }
}