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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptorCli = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const LambdaGlobalContext_1 = require("../../LambdaGlobalContext");
const CryptorModule_1 = require("../CryptorModule");
const DoubleEncryptionService_1 = require("../DoubleEncryptionService");
const TwoFaEncryptionClient_1 = require("../TwoFaEncryptionClient");
const crypto_1 = __importDefault(require("crypto"));
function decryptToHex(container, flags) {
    return __awaiter(this, void 0, void 0, function* () {
        const doubleEnc = container.get(DoubleEncryptionService_1.DoubleEncryptiedSecret);
        yield doubleEnc.init(flags.twoFaId || (0, ferrum_plumbing_1.panick)('--twoFaId is required'), flags.twoFa || (0, ferrum_plumbing_1.panick)('--twoFa is required'), flags.encryptedData || (0, ferrum_plumbing_1.panick)('--encryptedData is required'));
        return yield doubleEnc.secret();
    });
}
class CryptorCli {
    static prepCommand(c) {
        c
            .description('Ferrum Cryptor command line')
            .option('-i, --two-fa-id <type>', '2fa id ')
            .option('-t, --two-fa <type>', '2fa token')
            .option('-e, --secret-hex <type>', 'The secret in hex')
            .option('-u, --secret-text <type>', 'The secret in plain text')
            .option('-d, --encrypted-data <type>', 'Encrypted data (hex encoded)')
            .option('--aws-kms-key-arn <type>', 'Kms key ARN to be used for crypto: AWS_KMS_KEY_ARN env')
            .option('--two-fa-api-url <type>', 'Endpoint for 2f api or TWOFA_API_URL env')
            .option('--two-fa-api-access-key <type>', 'TWOFA_API_ACCESS_KEY env')
            .option('--two-fa-api-secret-key <type>', 'TWOFA_API_SECRET_KEY env');
    }
    static run(c) {
        return __awaiter(this, void 0, void 0, function* () {
            c.parse(process.argv);
            const flags = c.opts();
            const command = c.args[0];
            // console.log("OPS", flags);
            const container = yield LambdaGlobalContext_1.LambdaGlobalContext.container();
            container.registerModule(new CryptorModule_1.CryptorModule(flags.twoFaApiUrl || process.env.TWOFA_API_URL || (0, ferrum_plumbing_1.panick)('TWOFA_API_URL required'), flags.twoFaApiSecretKey || process.env.TWOFA_API_SECRET_KEY || (0, ferrum_plumbing_1.panick)('TWOFA_API_SECRET_KEY required'), flags.twoFaApiAccessKey || process.env.TWOFA_API_ACCESS_KEY || (0, ferrum_plumbing_1.panick)('TWOFA_API_ACCESS_KEY required'), flags.awsKmsKeyArn || process.env.AWS_KMS_KEY_ARN || (0, ferrum_plumbing_1.panick)('AWS_KMS_KEY_ARN required')));
            try {
                switch (command) {
                    case 'encrypt':
                        const dataToEncrypt = flags.secretHex || (flags.secretText ? Buffer.from(flags.secretText, 'utf-8').toString('hex') :
                            (0, ferrum_plumbing_1.panick)('--secretHex or --secretText is required'));
                        ferrum_plumbing_1.ValidationUtils.isTrue(dataToEncrypt.length % 2 === 0, 'Bad hex: ' + dataToEncrypt);
                        const res = yield container.get(DoubleEncryptionService_1.DoubleEncryptiedSecret).encrypt(flags.twoFaId || (0, ferrum_plumbing_1.panick)('--twoFaId is required'), flags.twoFa || (0, ferrum_plumbing_1.panick)('--twoFa is required'), dataToEncrypt);
                        console.log('Data (hex encrypted):');
                        console.log(dataToEncrypt);
                        console.log('Result:');
                        console.log(res);
                        return;
                    case 'privateKey':
                        const secretHex = crypto_1.default.randomBytes(32).toString('hex');
                        ferrum_plumbing_1.ValidationUtils.isTrue(secretHex.length === 64, 'Bad randomHex size!');
                        const histo = {};
                        secretHex.split('').forEach(c => histo[c] = (histo[c] || 0) + 1);
                        // If something is wrong with random. E.g. all zero, fail. User will not see the 
                        // generated data to know.
                        ferrum_plumbing_1.ValidationUtils.isTrue(!Object.keys(histo).find(c => histo[c] >= 10), 'Weird random. Try again');
                        const sk = yield container.get(DoubleEncryptionService_1.DoubleEncryptiedSecret).encrypt(flags.twoFaId || (0, ferrum_plumbing_1.panick)('--twoFaId is required'), flags.twoFa || (0, ferrum_plumbing_1.panick)('--twoFa is required'), secretHex);
                        console.log('Private key generated: *********');
                        console.log('Encrypted private key:');
                        console.log(sk);
                        return;
                    case 'decryptText':
                        const secretHexDec = yield decryptToHex(container, flags);
                        const secretText = Buffer.from(secretHexDec, 'hex').toString('utf-8');
                        console.log('Secret received:');
                        console.log(secretText);
                        return;
                    case 'decryptHex':
                        const secret = yield decryptToHex(container, flags);
                        console.log('Secret received:');
                        console.log(secret);
                        return;
                    case 'new-2fa':
                        const keys = yield container.get(TwoFaEncryptionClient_1.TwoFaEncryptionClient).newKey();
                        console.log('Two fa keys:');
                        console.log(keys);
                        return;
                    case 'print-config-template':
                        console.log(CONFIG_TEMPLATE);
                        return;
                    default:
                        console.log('Invalid arguments');
                        console.log('Supported: ', CryptorCli.args);
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
}
exports.CryptorCli = CryptorCli;
CryptorCli.description = 'Ferrum crypto command line';
CryptorCli.args = ['new-2fa', 'encrypt', 'decryptHex', 'decryptText', 'privateKey', 'print-config-template'];
const CONFIG_TEMPLATE = `
Set the following environment variables.

export AWS_KMS_KEY_ARN=
export TWOFA_API_ACCESS_KEY=
export TWOFA_API_SECRET_KEY=
export TWOFA_API_URL=
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
export AWS_DEFAULT_REGION=us-east-2
`;
//# sourceMappingURL=CryptorCli.js.map