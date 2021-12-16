import { hmac } from "ferrum-crypto";
import { AuthenticationProvider, AuthenticationVerifyer, HexString, ValidationUtils } from "ferrum-plumbing";
import { SecurityUtils } from "./SecurityUtils";

/**
 * Authenticate HMAC or generate the headers. timestamp must be synced with server.
 */
export class HmacAuthProvider implements AuthenticationProvider, AuthenticationVerifyer {
	constructor(
			private url: string,
			private postData: string,
			private timestamp: number,
			private secret?: HexString,
			private publicKey?: string,
			private publicToSecret?: (k: string) => Promise<string>,
		) {
	}

    asHeader(): { key: string; value: string } {
        return { key: 'X-Authorization', value: `hmac/${this.publicKey}/${this.timestamp}/${this.hash()}`, };
    }

	private hash() {
		ValidationUtils.isTrue(!!this.secret, 'secret is required for hmac');
		ValidationUtils.isTrue(!!this.postData, 'postData is required for hmac');
		ValidationUtils.isTrue(!!this.timestamp, 'timestamp is required for hmac');
		return hmac(this.secret!, (this.url || '') + '|' + this.timestamp + '|' + this.postData);
	}

    getAuthSession(): string {
        return this.publicKey || '';
    }

    isValid(headers: any): boolean {
		throw new Error('Cannot validate hmac synchronously')
    }

    async isValidAsync(headers: any): Promise<[boolean, string]> {
		const auth = headers['X-Authorization'] || headers['x-authorization'];
		if (!auth) { return [false, 'No auth header']; }
		const [prefix, pubKey, timestamp, hash] = auth.split('/');
		if (prefix !== 'hmac' || !pubKey || !hash) { return [false, 'Not hmac']; }
		ValidationUtils.isTrue(!!this.publicToSecret, 'publicToSecret not set');
		if (!SecurityUtils.timestampInRange(timestamp)) {
			return [false, 'Expired'];
		}
		this.timestamp = Number(timestamp);
		this.secret = await this.publicToSecret!(pubKey);
		if (!this.secret) { return [false, 'Invalid key']; }
		if (this.hash() !== hash) {
			return [false, 'Wrong hash'];
		}
		this.publicKey = pubKey;
		return [true, ''];
    }

    verify(headers: any): void {
		throw new Error('Cannot validate hmac synchronously');
    }

	async verifyAsync(headers: any): Promise<void> {
        ValidationUtils.isTrue(await this.isValid(headers), 'Unauthorized');
	}
}