import { LambdaHttpRequest, LambdaHttpResponse } from './LambdaHttpRequest';
import { LambdaSqsRequest } from './LambdaSqsRequest';
import {Injectable, LifecycleParent, LifecycleContext, JsonRpcRequest} from 'ferrum-plumbing';

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

function handlePreflight(request: any) {
    if (request.method === 'OPTIONS' || request.httpMethod === 'OPTIONS') {
        return {
            body: '',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': '*',
            },
            isBase64Encoded: false,
            statusCode: 200 as any,
        };
    }
}

export class LambdaHttpHandlerHelper {
    static preProcess(request: LambdaHttpRequest): {authToken?: string, preFlight?: any} {
        const preFlight = handlePreflight(request);
        if (preFlight) {
            return {preFlight};
        }
        const headers = request.headers as any;
        const authToken = (headers.authorization || headers.Authorization  || '').split(' ')[1];
        request.path = request.path || (request as any).url;
        return {authToken};
    }
}

export class HandlerFactory implements Injectable, LifecycleParent<LambdaHttpRequest | LambdaSqsRequest> {
  constructor(
    private sqsHandler: LambdaSqsHandler,
    private httpHandler: LambdaHttpHandler,
  ) {
  }
  private hType: 'http' | 'sqs' | undefined;

  get(hType: 'http' | 'sqs'): LambdaHttpHandler | LambdaSqsHandler {
    this.hType = hType;
    return hType === 'http' ? this.httpHandler : this.sqsHandler;
  }

  getLifecycleContext(): LifecycleContext<LambdaHttpRequest | LambdaSqsRequest> {
    if (!this.hType) {
      throw new Error('Trying to getLifecycleContext before handling any request');
    }
    const handler: any = this.hType === 'http' ? this.httpHandler : this.sqsHandler;
    if (handler.lastRequest === undefined) {
      throw new Error(`Trying to getLifecycleContext, while handing ${this.hType} request but handler has` +
          ` no 'lastRequest' field. Make sure your handler implements LastHandledRequest and sets 'lastRequest' in the handle method`);
    }
    return { context: {...handler.lastRequest, headers: {}} };
  }

  __name__(): string {
    return 'HandlerFactory';
  }
}
