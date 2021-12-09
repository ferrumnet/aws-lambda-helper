import { sha256sync, Ecdsa } from "ferrum-crypto";
import { AuthenticationProvider, AuthenticationVerifyer, HexString, ValidationUtils } from "ferrum-plumbing";
import { SecurityUtils } from "./SecurityUtils";

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
		const sig = this.sign();
		ValidationUtils.isTrue(!!this.address, 'EcdsaAuthProvider: No address');
        return {key: 'Authorization', value: `ecdsa/${this.address}/${this.timestamp}/${sig}`};
    }

	private hash() {
		ValidationUtils.isTrue(!!this.postData, 'postData is required for ecdsa hash');
		ValidationUtils.isTrue(!!this.timestamp, 'timestamp is required for ecdsa hash');
		return sha256sync((this.url || '') + this.timestamp + '|' + this.postData);
	}

    private sign() {
		ValidationUtils.isTrue(!!this.privateKey, 'privateKey is required for signing');
        const h = this.hash();
        const sig = Ecdsa.sign(this.privateKey!, h);
		this.address = Ecdsa.recoverAddress(sig, h);
		return sig;
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
		const [prefix, address, timestamp, sig] = auth.split('/');
		if (prefix !== 'ecdsa' || !timestamp || !sig) { return [false, 'Not ecdsa']; }
		ValidationUtils.isTrue(!!this.addressValid, 'addressValid not set');
		if (!SecurityUtils.timestampInRange(timestamp)) {
			return [false, 'Expired'];
		}
		this.timestamp = Number(timestamp);
		const recoveredAddress = Ecdsa.recoverAddress(sig, this.hash());
		if (address !== recoveredAddress) {
			return [false, 'Invalid signature'];
		}
		const valid = await this.addressValid!(address);
		if (!valid) {
			return [false, 'Invalid signer'];
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