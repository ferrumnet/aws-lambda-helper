import { AuthenticationProvider, AuthenticationVerifyer } from "ferrum-plumbing";
/**
 * Authenticate HMAC or generate the headers. timestamp must be synced with server.
 */
export declare class HmacAuthProvider implements AuthenticationProvider, AuthenticationVerifyer {
    private url;
    private postData;
    private timestamp;
    private secret?;
    private publicKey?;
    private publicToSecret?;
    constructor(url: string, postData: string, timestamp: number, secret?: string | undefined, publicKey?: string | undefined, publicToSecret?: ((k: string) => Promise<string>) | undefined);
    asHeader(): {
        key: string;
        value: string;
    };
    private hash;
    getAuthSession(): string;
    isValid(headers: any): boolean;
    isValidAsync(headers: any): Promise<[boolean, string]>;
    verify(headers: any): void;
    verifyAsync(headers: any): Promise<void>;
}
//# sourceMappingURL=HmacAuthProvider.d.ts.map