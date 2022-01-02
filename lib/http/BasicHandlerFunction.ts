import { LocalCache, Module, ValidationUtils } from "ferrum-plumbing";
import { LambdaGlobalContext } from "../LambdaGlobalContext";

const globalContainerCount = { cnt: 0 };
const globalCache = new LocalCache();

async function init(module: Module) {
    return globalCache.getAsync('CONTAINER', async () => {
        const container = await LambdaGlobalContext.container();
        if (globalContainerCount.cnt === 0) {
            console.error('ERROR! Multiple container per instance', globalContainerCount);
        }
        globalContainerCount.cnt += 1;
        await container.registerModule(module);
        return container;
    });
}

// Should be only one instance per lambda
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

