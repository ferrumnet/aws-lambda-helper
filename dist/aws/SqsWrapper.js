"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqsWrapper = void 0;
const MESSAGE_PROCESS_TIMEOUT = 400;
class SqsWrapper {
    constructor(conf, loggerFactory, sqs, sync, version, messageId) {
        this.conf = conf;
        this.sqs = sqs;
        this.sync = sync;
        this.version = version;
        this.messageId = messageId;
        this._onMessage = undefined;
        this.id = (1000000 + Math.random() * 999999).toString();
        this.log = loggerFactory.getLogger('SqsWrapper');
        this._fetch = this._fetch.bind(this);
        this.startPeriodicalFetch = this.startPeriodicalFetch.bind(this);
    }
    startPeriodicalFetch(scheduler) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                repeatPeriod: 11000,
                logErrors: true,
                retry: { count: 0 },
            };
            scheduler.schedulePeriodic(SqsWrapper.name, this._fetch, options);
        });
    }
    onMessageWithTimeout(data) {
        if (!this._onMessage) {
            this.log.error('Calling onMessageWithTimeout, but _onMessage is not set');
            return Promise.resolve();
        }
        const dis = this;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const tOut = setTimeout(() => {
                dis.log.error('onMessageWithTimeout: Timed out processing message ', data);
                reject(new Error('Timed out processing message'));
            }, MESSAGE_PROCESS_TIMEOUT);
            try {
                const res = yield dis._onMessage(data);
                resolve(res);
            }
            catch (e) {
                reject(e);
            }
            finally {
                clearTimeout(tOut);
            }
        }));
    }
    _fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.sqs.receiveMessage({
                QueueUrl: this.conf.sqsQueue,
                WaitTimeSeconds: 10,
                VisibilityTimeout: 30,
            }).promise();
            if (this.sync) {
                for (let msg of res.Messages || []) {
                    try {
                        let jsonMsg = undefined;
                        try {
                            jsonMsg = JSON.parse(msg.Body);
                        }
                        catch (e) {
                            this.log.error('listenForever: Error parsing message. Ignoring: ', msg);
                            yield this.deleteMessage(msg);
                        }
                        if (jsonMsg && jsonMsg.version == this.version && jsonMsg.messageId === this.messageId) {
                            try {
                                yield this.onMessageWithTimeout((JSON.parse(msg.Body)).data);
                                yield this.deleteMessage(msg);
                            }
                            catch (e) {
                                this.log.error('listenForever: Error processing message. Keeping it in the queue', e);
                                throw e;
                            }
                        }
                        else if (!!jsonMsg) {
                            this.log.error(`Received and invalid message; ignoring. Expected: ${this.messageId}@${this.version}` +
                                ` but received: ${jsonMsg.messageId}@${jsonMsg.version}: `, msg);
                            yield this.deleteMessage(msg);
                        }
                    }
                    catch (e) {
                        console.error('Error processing SQS message', e);
                        throw e;
                    }
                }
            }
            else {
                // TODO: This is broken
                throw new Error('Parallel SQS wrapper not implemented properly');
                const results = (res.Messages || []).map(msg => this._onMessage(JSON.parse(msg.Body)));
                yield Promise.all(results);
            }
        });
    }
    deleteMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sqs.deleteMessage({
                QueueUrl: this.conf.sqsQueue,
                ReceiptHandle: msg.ReceiptHandle,
            }).promise();
        });
    }
    send(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const wrappedMessage = {
                data: data,
                messageId: this.messageId,
                version: this.version,
            };
            yield this.sqs.sendMessage({
                QueueUrl: this.conf.sqsQueue,
                MessageBody: JSON.stringify(wrappedMessage),
            }).promise();
        });
    }
    listen(fun) {
        this._onMessage = fun;
    }
}
exports.SqsWrapper = SqsWrapper;
//# sourceMappingURL=SqsWrapper.js.map