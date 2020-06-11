import { UnifyreExtensionKitClient } from 'unifyre-extension-sdk';
import { AppUserProfile } from 'unifyre-extension-sdk/dist/client/model/AppUserProfile';
export declare class UnifyreBackendProxyService {
    private unifyreKitFactory;
    private jwtRandomKey;
    constructor(unifyreKitFactory: () => UnifyreExtensionKitClient, jwtRandomKey: string);
    signInToServer(token: string, expiresIn?: string): Promise<[AppUserProfile, string]>;
    signInUsingToken(jsonToken: string): string;
    private newSession;
}
//# sourceMappingURL=UnifyreBackendProxyService.d.ts.map