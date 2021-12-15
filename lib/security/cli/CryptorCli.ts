import {Command, flags} from '@oclif/command';
import { Container, EncryptedData, panick, TypeUtils, ValidationUtils } from 'ferrum-plumbing';
import { LambdaGlobalContext } from '../../LambdaGlobalContext';
import { CryptorModule } from '../CryptorModule';
import { DoubleEncryptiedSecret } from '../DoubleEncryptionService';
import { TwoFaEncryptionClient } from '../TwoFaEncryptionClient';
import crypto from 'crypto';
import { SecurityUtils } from '../SecurityUtils';

async function decryptToHex(container: Container, flags: any) {
	const doubleEnc = container.get<DoubleEncryptiedSecret>(DoubleEncryptiedSecret);
	await doubleEnc.init(
		flags.twoFaId || panick('--twoFaId is required') as any,
		flags.twoFa || panick('--twoFa is required') as any,
		flags.encryptedData || panick('--encryptedData is required') as any
	);
	return await doubleEnc.secret();
}

export class CryptorCli extends Command {
	static description = 'Ferrum crypto command line';

	static flags = {
		help: flags.help({char: 'h'}),
		twoFaId: flags.string({description: '2fa id'}),
		twoFa: flags.string({description: '2fa (6 digit number) from google authenticator'}),
		secretHex: flags.string({description: 'The secret in hex'}),
		secretText: flags.string({description: 'The secret in plain text'}),
		encryptedData: flags.string({description: 'Encrypted data, data field'}),
		awsSecretKey: flags.string({description: 'The secret in plain text'}),
		awsAccessKeyId: flags.string({description: 'AWS_ACCESS_KEY_ID or env'}),
		awsSecretAccessKeyId: flags.string({description: 'AWS_SECRET_ACCESS_KEY_ID or env'}),
		awsKmsKeyArn: flags.string({description: 'Kms key ARN to be used for crypto: AWS_KMS_KEY_ARN env'}),
		awsDefaultRegion: flags.string({description: 'AWS_DEFAULT_REGION env'}),
		twoFaApiUrl: flags.string({description: 'TWOFA_API_URL env'}),
		twoFaApiSecretKey: flags.string({description: 'TWOFA_API_SECRET_KEY env'}),
		twoFaApiAccessKey: flags.string({description: 'TWOFA_API_ACCESS_KEY env'}),
	}

	static args = [
		{
			name: 'command',
			require: true,
			description: 'Crypto commands',
			options: ['new-2fa', 'encrypt', 'decryptHex', 'decryptText', 'privateKey'],
		}
	]

	async run() {
		const {args, flags} = this.parse(CryptorCli);
    	const container = await LambdaGlobalContext.container();
		container.registerModule(new CryptorModule(
			flags.twoFaApiUrl || process.env.TWOFA_API_URL || panick('TWOFA_API_URL required') as any,
			flags.twoFaApiSecretKey || process.env.TWOFA_API_SECRET_KEY || panick('TWOFA_API_SECRET_KEY required') as any,
			flags.twoFaApiAccessKey || process.env.TWOFA_API_ACCESS_KEY || panick('TWOFA_API_ACCESS_KEY required') as any,
			flags.awsKmsKeyArn || process.env.AWS_KMS_KEY_ARN || panick('AWS_KMS_KEY_ARN required') as any,
		));

		try {
			switch(args.command) {
				case 'encrypt':
					const dataToEncrypt = flags.secretHex || (flags.secretText ? Buffer.from(flags.secretText!, 'utf-8').toString('hex') :
						panick('--secretHex or --secretText is required') as any);
					ValidationUtils.isTrue(dataToEncrypt.length % 2 === 0, 'Bad hex: ' + dataToEncrypt);
					const res = await container.get<DoubleEncryptiedSecret>(DoubleEncryptiedSecret).encrypt(
						flags.twoFaId || panick('--twoFaId is required') as any,
						flags.twoFa || panick('--twoFa is required') as any,
						dataToEncrypt,
					);
					console.log('Data (hex encrypted):')
					console.log(dataToEncrypt);
					console.log('Result:');
					console.log(res);
					return;
				case 'privateKey':
					const secretHex = crypto.randomBytes(32).toString('hex');
					ValidationUtils.isTrue(secretHex.length === 64, 'Bad randomHex size!');
					const histo: any = {}
					secretHex.split('').forEach(c => histo[c] = (histo[c] || 0) + 1);
					// If something is wrong with random. E.g. all zero, fail. User will not see the 
					// generated data to know.
					ValidationUtils.isTrue(!Object.keys(histo).find(c => histo[c] >= 10), 'Weird random. Try again');
					const sk = await container.get<DoubleEncryptiedSecret>(DoubleEncryptiedSecret).encrypt(
						flags.twoFaId || panick('--twoFaId is required') as any,
						flags.twoFa || panick('--twoFa is required') as any,
						secretHex,
					);
					console.log('Private key generated: *********')
					console.log('Encrypted private key:');
					console.log(sk);
					return;
				case 'decryptText':
					const secretHexDec = await decryptToHex(container, flags);
					const secretText = Buffer.from(secretHexDec, 'hex').toString('utf-8');
					console.log('Secret received:');
					console.log(secretText);
					return;
				case 'decryptHex':
					const secret = await decryptToHex(container, flags);
					console.log('Secret received:');
					console.log(secret);
					return;
				case 'new-2fa':
					const keys = await container.get<TwoFaEncryptionClient>(TwoFaEncryptionClient).newKey();
					console.log('Two fa keys:');
					console.log(keys);
					return;
			}
		} catch (e) {
			console.error(e as Error);
		}
	}
}