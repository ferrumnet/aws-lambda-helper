import { Container, panick, ValidationUtils } from 'ferrum-plumbing';
import { LambdaGlobalContext } from '../../LambdaGlobalContext';
import { CryptorModule } from '../CryptorModule';
import { DoubleEncryptiedSecret } from '../DoubleEncryptionService';
import { TwoFaEncryptionClient } from '../TwoFaEncryptionClient';
import crypto from 'crypto';
import { Command } from 'commander';


async function decryptToHex(container: Container, flags: any) {
	const doubleEnc = container.get<DoubleEncryptiedSecret>(DoubleEncryptiedSecret);
	await doubleEnc.init(
		flags.twoFaId || panick('--twoFaId is required') as any,
		flags.twoFa || panick('--twoFa is required') as any,
		flags.encryptedData || panick('--encryptedData is required') as any
	);
	return await doubleEnc.secret();
}

export class CryptorCli {
	static description = 'Ferrum crypto command line';

	static prepCommand(c: Command) {
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
			.option('--two-fa-api-secret-key <type>', 'TWOFA_API_SECRET_KEY env')
	}

	static args = ['new-2fa', 'encrypt', 'decryptHex', 'decryptText', 'privateKey', 'print-config-template'];

	static async run(c: Command) {
		c.parse(process.argv);
		const flags = c.opts();
		const command = c.args[0];
		// console.log("OPS", flags);

    	const container = await LambdaGlobalContext.container();
		container.registerModule(new CryptorModule(
			flags.twoFaApiUrl || process.env.TWOFA_API_URL || panick('TWOFA_API_URL required') as any,
			flags.twoFaApiSecretKey || process.env.TWOFA_API_SECRET_KEY || panick('TWOFA_API_SECRET_KEY required') as any,
			flags.twoFaApiAccessKey || process.env.TWOFA_API_ACCESS_KEY || panick('TWOFA_API_ACCESS_KEY required') as any,
			flags.awsKmsKeyArn || process.env.AWS_KMS_KEY_ARN || panick('AWS_KMS_KEY_ARN required') as any,
		));

		try {
			switch(command) {
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
				case 'print-config-template':
					console.log(CONFIG_TEMPLATE);
					return;
				default:
					console.log('Invalid arguments');
					console.log('Supported: ', CryptorCli.args);
			}
		} catch (e) {
			console.error(e as Error);
		}
	}
}

const CONFIG_TEMPLATE = `
Set the following environment variables.

export AWS_KMS_KEY_ARN=
export TWOFA_API_ACCESS_KEY=
export TWOFA_API_SECRET_KEY=
export TWOFA_API_URL=
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
export AWS_DEFAULT_REGION=us-east-2
`