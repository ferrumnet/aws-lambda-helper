import { Command, flags } from '@oclif/command';
export declare class CryptorCli extends Command {
    static description: string;
    static flags: {
        help: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
        twoFaId: flags.IOptionFlag<string | undefined>;
        twoFa: flags.IOptionFlag<string | undefined>;
        secretHex: flags.IOptionFlag<string | undefined>;
        secretText: flags.IOptionFlag<string | undefined>;
        encryptedData: flags.IOptionFlag<string | undefined>;
        awsSecretKey: flags.IOptionFlag<string | undefined>;
        awsAccessKeyId: flags.IOptionFlag<string | undefined>;
        awsSecretAccessKeyId: flags.IOptionFlag<string | undefined>;
        awsKmsKeyArn: flags.IOptionFlag<string | undefined>;
        awsDefaultRegion: flags.IOptionFlag<string | undefined>;
        twoFaApiUrl: flags.IOptionFlag<string | undefined>;
        twoFaApiSecretKey: flags.IOptionFlag<string | undefined>;
        twoFaApiAccessKey: flags.IOptionFlag<string | undefined>;
    };
    static args: {
        name: string;
        require: boolean;
        description: string;
        options: string[];
    }[];
    run(): Promise<void>;
}
//# sourceMappingURL=CryptorCli.d.ts.map