import { AuthenticationProvider, AuthenticationVerifyer } from "ferrum-plumbing";
/**
 * Authenticate, or create headers for, using ECDSA signature. The authSession is the authenticated address.
 */
export declare class EcdsaAuthProvider implements AuthenticationProvider, AuthenticationVerifyer {
    private url;
    private postData;
    private timestamp?;
    private privateKey?;
    private addressValid?;
    private address;
    constructor(url: string, postData: string, timestamp?: number | undefined, privateKey?: string | undefined, addressValid?: ((k: string) => Promise<boolean>) | undefined);
    asHeader(): {
        key: string;
        value: string;
    };
    private hash;
    private sign;
    getAuthSession(): string;
    isValid(headers: any): boolean;
    isValidAsync(headers: any): Promise<[boolean, string]>;
    verify(headers: any): void;
    verifyAsync(headers: any): Promise<void>;
}
//# sourceMappingURL=EcdsaAuthProvider.d.ts.map