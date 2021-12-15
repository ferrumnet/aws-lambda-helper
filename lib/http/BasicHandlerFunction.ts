import { Module } from "ferrum-plumbing";
import { LambdaGlobalContext } from "../LambdaGlobalContext";

const global = { init: false };

async function init(module: Module) {
    if (global.init) {
        return LambdaGlobalContext.container();
    }
    const container = await LambdaGlobalContext.container();
    await container.registerModule(module);
    global.init = true;
    return container;
}

export class BasicHandlerFunction {
    constructor(public module: Module) {
        this.handler = this.handler.bind(this);
    }

    // Once registered this is the handler code for lambda_template
    async handler(event: any, context: any) {
        try {
            const container = await init(this.module);
            const lgc = container.get<LambdaGlobalContext>(LambdaGlobalContext);
            return await lgc.handleAsync(event, context);
        } catch (e) {
            console.error(e);
            return {
                body: (e as Error).message,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Accept-Encoding, Accept-Language, Authorization, Host',
                },
                isBase64Encoded: false,
                statusCode: 500,
            }
        }
    }
}
