import { NetworkedConfig } from "ferrum-plumbing";
export declare function networkEnvConfig<T>(networks: string[], prefix: string, fun: (v: string) => T): NetworkedConfig<T> | undefined;
export declare function loadConfigFromFile<T>(path?: string): T;
//# sourceMappingURL=DevConfigUtils.d.ts.map