import { SecureDataStorageBase, SecureDataStorageItem } from "./SecureDataStorageBase";
import { KmsCryptor } from "../../aws/KmsCryptor";
import { Connection, Document } from "mongoose";
export declare const TestStorageModel: (c: Connection) => import("mongoose").Model<SecureDataStorageItem & Document<any, any, any>, {}, {}, {}>;
export declare class TestStorage extends SecureDataStorageBase<{}, {}> {
    constructor(kms: KmsCryptor);
    initModels(con: Connection): void;
}
//# sourceMappingURL=SecureDataStorageBase.test.d.ts.map