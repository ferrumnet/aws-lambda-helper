import { AuthenticationTokenType, AuthTokens } from "../security/AuthTokenParser";
export interface HttpRequestData {
    command: string;
    data: any;
    userId?: string;
}
export declare type RequestProcessorFunction = (req: HttpRequestData, userId?: string) => Promise<any>;
export declare type RequestProcessorFunctionAuth = (req: HttpRequestData, auth: AuthTokens) => Promise<any>;
export declare type RequestProcessorMap = {
    [k: string]: RequestProcessorFunction;
};
export declare type RequestProcessorMapAuth = {
    [k: string]: RequestProcessorFunctionAuth;
};
export declare abstract class HttpRequestProcessor {
    private processor;
    private processorAuth;
    protected registerProcessor(command: string, fun: RequestProcessorFunction): void;
    protected registerProcessorAuth(command: string, fun: RequestProcessorFunctionAuth): void;
    for(command: string): RequestProcessorFunction | undefined;
    forAuth(command: string): RequestProcessorFunctionAuth | undefined;
    static authType(token: string): AuthenticationTokenType;
}
//# sourceMappingURL=HttpRequestProcessor.d.ts.map