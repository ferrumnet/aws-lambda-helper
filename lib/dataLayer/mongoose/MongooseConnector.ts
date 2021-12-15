import {Connection, createConnection, set} from 'mongoose';
import {MongooseConfig} from "./Types";
import {Injectable, ValidationUtils} from "ferrum-plumbing";

export abstract class MongooseConnection implements Injectable {
    private isInit: boolean = false;
    async init(config: MongooseConfig): Promise<void> {
        const connStr = config.connectionString ||
            `mongodb://${config.user}:${config.pw}@${config.endpoint}/${config.database}`;
        const con = await createConnection(connStr);
        this.initModels(con);
        this.isInit = true;
    }

    protected verifyInit() {
        ValidationUtils.isTrue(this.isInit, 'Mongoose connection is not initialized');
    }

    abstract initModels(con: Connection): void;

    __name__() { return 'MongooseConnection'; }
}
