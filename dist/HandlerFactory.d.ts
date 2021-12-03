import { LambdaHttpRequest, LambdaHttpResponse } from './LambdaHttpRequest';
import { LambdaSqsRequest } from './LambdaSqsRequest';
import { Injectable, LifecycleParent, LifecycleContext } from 'ferrum-plumbing';
interface Handler<TReq, TCon, TRes> {
    handle(req: TReq, context: TCon): Promise<TRes>;
}
export interface LastHandledRequest {
    lastRequest: LambdaHttpRequest | LambdaSqsRequest;
}
export interface LambdaSqsHandler extends Handler<LambdaSqsRequest, any, any> {
}
export interface LambdaHttpHandler extends Handler<LambdaHttpRequest, any, LambdaHttpResponse> {
}
export declare class LambdaHttpHandlerHelper {
    static preProcess(request: LambdaHttpRequest): {
        authToken?: string;
        preFlight?: any;
    };
}
export declare class HandlerFactory implements Injectable, LifecycleParent<LambdaHttpRequest | LambdaSqsRequest> {
    private sqsHandler;
    private httpHandler;
    constructor(sqsHandler: LambdaSqsHandler, httpHandler: LambdaHttpHandler);
    private hType;
    get(hType: 'http' | 'sqs'): LambdaHttpHandler | LambdaSqsHandler;
    getLifecycleContext(): LifecycleContext<LambdaHttpRequest | LambdaSqsRequest>;
    __name__(): string;
}
export {};
//# sourceMappingURL=HandlerFactory.d.ts.map