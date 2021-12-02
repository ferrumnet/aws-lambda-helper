import { sha256sync, Ecdsa } from "ferrum-crypto";
import { AuthenticationProvider, AuthenticationVerifyer, HexString, ValidationUtils } from "ferrum-plumbing";

/**
 * Authenticate, or create headers for, using ECDSA signature. The authSession is the authenticated address.
 */
export class EcdsaAuthProvider implements AuthenticationProvider, AuthenticationVerifyer {
	private address: string | undefined;
	constructor(
            private url: string,
            private postData: string,
			private timestamp?: number,
			private privateKey?: HexString,
			private addressValid?: (k: string) => Promise<boolean>,
		) {
	}

    asHeader(): { key: string; value: string } {
        return {key: 'Authorization', value: `ecdsa/${this.timestamp}/${this.sign()}`};
    }

	private hash() {
		ValidationUtils.isTrue(!!this.postData, 'postData is required for ecdsa hash');
		ValidationUtils.isTrue(!!this.timestamp, 'timestamp is required for ecdsa hash');
		return sha256sync((this.url || '') + this.timestamp + '|' + this.postData);
	}

    private sign() {
		ValidationUtils.isTrue(!!this.privateKey, 'privateKey is required for signing');
        const h = this.hash();
        return Ecdsa.sign(this.privateKey!, h);
    }

    getAuthSession(): string {
        return this.address || '';
    }

    isValid(headers: any): boolean {
		throw new Error('Cannot validate hmac synchronously')
    }

    async isValidAsync(headers: any): Promise<[boolean, string]> {
		const auth = headers['Authorization'] || headers['authorization'];
		if (!auth) { return [false, 'No authorization header']; }
		const [prefix, timestamp, sig] = auth.split('/');
		if (prefix !== 'ecdsa' || !timestamp || !sig) { return [false, 'Not ecdsa']; }
		ValidationUtils.isTrue(!!this.addressValid, 'addressValid not set');
		this.timestamp = Number(timestamp);
		const address = Ecdsa.recoverAddress(sig, this.hash());
		const valid = await this.addressValid!(address);
		if (!valid) {
			return [false, 'Invalid signature'];
		}
		this.address = address;
		return [true, ''];
    }

    verify(headers: any): void {
		throw new Error('Cannot validate hmac synchronously')
    }

	async verifyAsync(headers: any): Promise<void> {
        ValidationUtils.isTrue(await this.isValid(headers), 'Unauthorized');
	}
}