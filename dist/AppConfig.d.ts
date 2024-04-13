import { NetworkedConfig } from "ferrum-plumbing";
import { MongooseConfig } from "./dataLayer/mongoose/Types";
import { BackendConstants } from "./types/BackendConstants";
export interface WithJwtRandomBaseConfig {
    jwtRandomBase: string;
}
export interface WithDatabaseConfig {
    database: MongooseConfig;
}
export interface WithKmsConfig {
    cmkKeyId: string;
}
/**
 * Configuratio for the app.
 * Examples:
 * const c = AppConfig.instance();
 * (await c.fromSecret('CHAIN_CLIENTS')).
 *   .orElse(() => return ({
 *     ETHEREUM: AppConfig.fromEnv('ETHEREUM_ENDPOINT'),
 *   }))
 *   .required<Web3EndpointConfig>(c => ({
 *      'Eth Endpoint required': c.ETHEREUM,
 *   }))
 *   .get<Web3EndpointConfig>();
 */
export declare class AppConfig {
    private static _instance;
    private static DEFAULT_CONSTANTS;
    private static CONFIG_FILE_PREFIX;
    static instance(): AppConfig;
    static env(e: string, def?: string): string | undefined;
    static awsRegion(): string;
    private conf;
    private _constants;
    get<T>(field?: string): T;
    fromFile(field?: string, path?: string): this;
    /**
     * Loads configuration from secret. If secret not configured, it will check the config file.
     */
    fromSecret(field: string, secretSuffix: string): Promise<this>;
    loadConstants(path?: string): Promise<void>;
    constants(): BackendConstants;
    /**
     * Configs chain providers. By default it expects the providers field in the config
     * file.
     * If the chain config file exists the following environment variables must be provided:
     * CONFIG_FILE_CHAIN_CONFIG="..."
     */
    forChainProviders(field?: string, supportedChains?: string[]): Promise<this>;
    getChainProviders(field?: string): NetworkedConfig<string>;
    orElse(field: string, setter: () => any): this;
    set(field: string, setter: () => any): this;
    required<T>(field: string, selector: (c: T) => any): this;
    chainsRequired(field: string, chains: string[]): this;
}
//# sourceMappingURL=AppConfig.d.ts.map