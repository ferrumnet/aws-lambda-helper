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
const command_1 = require("@oclif/command");
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
class CryptorCli extends command_1.Command {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const { args, flags } = this.parse(CryptorCli);
            const container = yield LambdaGlobalContext_1.LambdaGlobalContext.container();
            container.registerModule(new CryptorModule_1.CryptorModule(flags.twoFaApiUrl || process.env.TWOFA_API_URL || (0, ferrum_plumbing_1.panick)('TWOFA_API_URL required'), flags.twoFaApiSecretKey || process.env.TWOFA_API_SECRET_KEY || (0, ferrum_plumbing_1.panick)('TWOFA_API_SECRET_KEY required'), flags.twoFaApiAccessKey || process.env.TWOFA_API_ACCESS_KEY || (0, ferrum_plumbing_1.panick)('TWOFA_API_ACCESS_KEY required'), flags.awsKmsKeyArn || process.env.AWS_KMS_KEY_ARN || (0, ferrum_plumbing_1.panick)('AWS_KMS_KEY_ARN required')));
            try {
                switch (args.command) {
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
CryptorCli.flags = {
    help: command_1.flags.help({ char: 'h' }),
    twoFaId: command_1.flags.string({ description: '2fa id' }),
    twoFa: command_1.flags.string({ description: '2fa (6 digit number) from google authenticator' }),
    secretHex: command_1.flags.string({ description: 'The secret in hex' }),
    secretText: command_1.flags.string({ description: 'The secret in plain text' }),
    encryptedData: command_1.flags.string({ description: 'Encrypted data, data field' }),
    awsSecretKey: command_1.flags.string({ description: 'The secret in plain text' }),
    awsAccessKeyId: command_1.flags.string({ description: 'AWS_ACCESS_KEY_ID or env' }),
    awsSecretAccessKeyId: command_1.flags.string({ description: 'AWS_SECRET_ACCESS_KEY_ID or env' }),
    awsKmsKeyArn: command_1.flags.string({ description: 'Kms key ARN to be used for crypto: AWS_KMS_KEY_ARN env' }),
    awsDefaultRegion: command_1.flags.string({ description: 'AWS_DEFAULT_REGION env' }),
    twoFaApiUrl: command_1.flags.string({ description: 'TWOFA_API_URL env' }),
    twoFaApiSecretKey: command_1.flags.string({ description: 'TWOFA_API_SECRET_KEY env' }),
    twoFaApiAccessKey: command_1.flags.string({ description: 'TWOFA_API_ACCESS_KEY env' }),
};
CryptorCli.args = [
    {
        name: 'command',
        require: true,
        description: 'Crypto commands',
        options: ['new-2fa', 'encrypt', 'decryptHex', 'decryptText', 'privateKey'],
    }
];
//# sourceMappingURL=CryptorCli.js.map