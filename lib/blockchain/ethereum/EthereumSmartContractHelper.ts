import { HexString, Injectable, LocalCache, ValidationUtils } from "ferrum-plumbing";
import erc20Abi from './resources/IERC20.json';
import Web3 from 'web3';
import Big from 'big.js';
import { CustomTransactionCallRequest, GasParameters } from "unifyre-extension-sdk";
import { ethers, PopulatedTransaction } from 'ethers';
import { Eth } from "web3-eth";

export type Web3ProviderConfig = { [network: string]: string };

const PROVIDER_TIMEOUT = 1000 * 3600;
const BLOCK_CACH_TIMEOUT = 1000 * 360;

const MAX_AMOUNT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

export class Web3Utils {
    static TRANSACTION_TIMEOUT = 36 * 1000;
    static DEFAULT_APPROVE_GAS = 60000;

    static isZeroAddress(val: string) {
        return !val || !val.replace(/[0xX]*/,'').length;
    }

    static zX(str: string): string {
        if (str.startsWith('0x')) { return str; }
        return str;
    }
}

export async function tryWithBytes32(web3: any, name: string, address: string, fun: () => Promise<any>) {
    try {
        return await fun();
    } catch(e) {
        const cont = new web3.Contract([{
            "constant": true,
            "inputs": [],
            "name": name,
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }], address);
        const val = await cont.methods[name]().call();
        return Web3.utils.hexToUtf8(val);
    }
}

export type EthereumTransactionStatus = 'timedout' | 'failed' | 'pending' | 'successful';

export interface EthereumTransactionSummary {
    network: string;
    id: string;
    status: EthereumTransactionStatus;
    confirmationTime: number;
    confirmations: number;
};

export class EthereumSmartContractHelper implements Injectable {
    private cache: LocalCache;
    constructor(
        private provider: Web3ProviderConfig,
    ) {
        this.cache = new LocalCache();
    }

    __name__() { return 'EthereumSmartContractHelper'; }

    async getTransactionStatus(network: string, tid: string, submissionTime: number):
        Promise<EthereumTransactionStatus|undefined> {
        const ts = await this.getTransactionSummary(network, tid, submissionTime);
        return ts ? ts.status : undefined;
    }

    async getTransactionSummary(network: string, tid: string, submissionTime?: number):
        Promise<EthereumTransactionSummary|undefined> {
        const web3 = this.web3(network);
        const t = await web3.getTransaction(tid);
        if (!t) {
            return undefined;
        }
        if (!t && !!submissionTime &&
                ((submissionTime + Web3Utils.TRANSACTION_TIMEOUT) < Date.now()) ) {
            return {
                network, id: tid,
                confirmationTime: 0,
                confirmations: 0,
                status: 'timedout',
            };
        }
        if (!t || !t.blockNumber) {
            return {
                network, id: tid,
                confirmationTime: 0,
                confirmations: 0,
                status: 'pending',
            }
        }
        const receipt = await web3.getTransactionReceipt(tid);
        const status = !!receipt.status ? 'successful' : 'failed';
        const block = await web3.getBlockNumber();
        const txBlock = await this.blockByNumber(network, t.blockNumber);
        return {
            network, id: tid,
            confirmationTime: Number(txBlock.timestamp || '0') * 1000,
            confirmations: (block - txBlock.number) + 1,
            status,
        }
    }

    public async blockByNumber(network: string, blockNo: number) {
        try {
            return await this.cache.getAsync(`BLOCK_BY_NO:${network}/${blockNo}`, async () => {
                const web3 = this.web3(network);
                const block = await web3.getBlock(blockNo, false);
                return block;
            }, BLOCK_CACH_TIMEOUT);
        } catch(e) {
            throw new Error(`Error calling getBlock(${blockNo}) for ${network}: ${e as Error}`);
        }
    }

    public async approveMaxRequests(
        currency: string,
        approver: string,
        value: string,
        approvee: string,
        approveeName: string,
        nonce?: number,
        ): Promise<[number, CustomTransactionCallRequest[]]> {
        return this._approveRequests(currency, approver, value, approvee, approveeName, true, nonce);
    }

    public async approveRequests(
        currency: string,
        approver: string,
        value: string,
        approvee: string,
        approveeName: string,
        nonce?: number,
        ): Promise<[number, CustomTransactionCallRequest[]]> {
        return this._approveRequests(currency, approver, value, approvee, approveeName, false, nonce);
    }

    private async _approveRequests(
        currency: string,
        approver: string,
        value: string,
        approvee: string,
        approveeName: string,
        maxAmount: boolean,
        nonce?: number,
        ): Promise<[number, CustomTransactionCallRequest[]]> {
        ValidationUtils.isTrue(!!approver, "'approver' must be provided");
        ValidationUtils.isTrue(!!approvee, "'approvee' must be provided");
        ValidationUtils.isTrue(!!approveeName, "'approveeName' must be provided");
        ValidationUtils.isTrue(!!currency, "'currency' must be provided");
        ValidationUtils.isTrue(!!value, "'value' must be provided");
        const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
        const tokDecimalFactor = 10 ** await this.decimals(currency);
        const amount = new Big(value).times(new Big(tokDecimalFactor));
        nonce = nonce || await this.web3(network).getTransactionCount(approver, 'pending');
        const amountHuman = amount.div(tokDecimalFactor).toString();
        const symbol = await this.symbol(currency);
        let requests: CustomTransactionCallRequest[] = [];
        return await this.addApprovesToRequests(requests, nonce!,
            amount, amountHuman, token, symbol, currency, approver, approvee,
            approveeName, maxAmount);
    }

    private async addApprovesToRequests(requests: CustomTransactionCallRequest[],
            nonce: number,
            amount: Big,
            amountHuman: string,
            token: string,
            symbol: string,
            currency: string,
            address: string,
            approvee: string,
            approveeName: string,
            useMax: boolean,
            ): Promise<[number, CustomTransactionCallRequest[]]> {
        const currentAllowance = await this.currentAllowance(currency, address, approvee);
        if (currentAllowance.lt(amount)) {
            let approveGasOverwite: number = 0;
            if (currentAllowance.gt(new Big(0))) {
                const [approveToZero, approveToZeroGas] = await this.approveToZero(currency, address,
                    approvee);
                requests.push(
                    EthereumSmartContractHelper.callRequest(token, currency, address, approveToZero,
                        approveToZeroGas.toString(), nonce,
                        `Zero out the approval for ${symbol} by ${approveeName}`,),
                        );
                nonce++;
                approveGasOverwite = approveToZeroGas;
            }
            const [approve, approveGas] = useMax ? await this.approveMax(currency, address,
                    approvee, approveGasOverwite) :
                await this.approve(currency, address,
                    amount, approvee, approveGasOverwite);
            requests.push(
                EthereumSmartContractHelper.callRequest(token, currency, address, approve, approveGas.toString(), nonce,
                    `Approve ${useMax ? 'max' : amountHuman} ${symbol} to be spent by ${approveeName}`,)
            );
            nonce++;
        }
        return [nonce, requests];
    }

    public async approveToZero(currency: string, from: string, approvee: string): Promise<[HexString, number]> {
        const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
        const m = this.erc20(network, token).methods.approve(approvee, '0');
        const gas = await m.estimateGas({from});
        return [m.encodeABI(), gas];
    }

    public async approve(currency: string,
            from: string,
            rawAmount: Big,
            approvee: string,
            useThisGas: number): Promise<[HexString, number]> {
        const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
        console.log('about to approve: ', { from, token, approvee, amount: rawAmount.toFixed(), })
        const m = this.erc20(network, token).methods.approve(approvee, rawAmount.toFixed());
        const gas = !!useThisGas ? Math.max(useThisGas, Web3Utils.DEFAULT_APPROVE_GAS) : await m.estimateGas({from});
        return [m.encodeABI(), gas];
    }

    public async approveMax(currency: string,
            from: string,
            approvee: string,
            useThisGas: number): Promise<[HexString, number]> {
        const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
        console.log('about to approve max: ', { from, token, approvee})
        const m = this.erc20(network, token).methods.approve(approvee, MAX_AMOUNT);
        const gas = !!useThisGas ? Math.max(useThisGas, Web3Utils.DEFAULT_APPROVE_GAS) :
            await m.estimateGas({from});
        return [m.encodeABI(), gas];
    }

    public async currentAllowance(currency: string, from: string, approvee: string) {
        const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
        const allowance = await this.erc20(network, token).methods.allowance(from, approvee).call();
        const bAllownace = new Big(allowance.toString());
        console.log('current allowance is ', bAllownace.toString(), ' for ', approvee, 'from', from);
        return bAllownace;
    }

    public async amountToMachine(currency: string, amount: string): Promise<string> {
        const decimal = await this.decimals(currency);
        const decimalFactor = 10 ** decimal;
        return new Big(amount).times(decimalFactor).toFixed(0);
    }

    public async amountToHuman(currency: string, amount: string): Promise<string> {
        const decimal = await this.decimals(currency);
        const decimalFactor = 10 ** decimal;
        return new Big(amount).div(decimalFactor).toFixed();
    }

    public async symbol(currency: string): Promise<string> {
        const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
        return this.cache.getAsync('SYMBOLS_' + currency, async () => {
            const tokenCon = this.erc20(network, token);
            return tryWithBytes32(this.web3(network), 'symbol', token, async () => 
                await tokenCon.methods.symbol().call());
        });
    }

    public async decimals(currency: string): Promise<number> {
        const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
        return this.cache.getAsync('DECIMALS_' + currency, () => {
            const tokenCon = this.erc20(network, token);
            return tokenCon.methods.decimals().call();
        });
    }

    public async name(currency: string): Promise<string> {
        const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
        try {
            return this.cache.getAsync('NAME_' + currency, () => {
                const tokenCon = this.erc20(network, token);
                return tokenCon.methods.name().call();
            });
        } catch (e) { return ''; }
    }

    public erc20(network: string, token: string) {
        const web3 = this.web3(network);
        return new web3.Contract(erc20Abi as any, token);
    }

    public gasPrice(network: string) {   
        const web3 = this.web3(network);
        return web3.getGasPrice();
    }

    private _web3(network: string): Web3 {
        ValidationUtils.isTrue(!!this.provider[network], 'No provider is configured for ' + network);
        const key = 'PROVIDER_' + network;
        let prov = this.cache.get(key);
        if (!prov) {
            prov = new Web3(new Web3.providers.HttpProvider( this.provider[network]));
            this.cache.set(key, prov, PROVIDER_TIMEOUT);
        }
        return prov;
    }

    public web3Eth(network: string) {
		return this.web3(network) as Eth;
    }

    public web3(network: string) {
		return (this._web3(network) || {} as any).eth;
    }

	public ethersProvider(network: string) {
        ValidationUtils.isTrue(!!this.provider[network], 'No provider is configured for ' + network);
        const key = 'PROVIDER_ETHERS_' + network;
        let prov = this.cache.get(key);
        if (!prov) {
			prov = new ethers.providers.JsonRpcProvider(this.provider[network]);
            this.cache.set(key, prov, PROVIDER_TIMEOUT);
        }
        return prov;
	}

	public static fromTypechainTransaction(t: PopulatedTransaction): CustomTransactionCallRequest {
		return {
			amount: '',
			gas: {
				gasLimit: (t.gasLimit || '').toString(),
				gasPrice: (t.gasPrice || '').toString(),
			} as GasParameters,
			contract: t.to,
			currency: '',
			data: t.data,
			from: t.from,
			description: ``,
			nonce: t.nonce,
			value: t.value,
		} as CustomTransactionCallRequest;
	}

	public async fromTypechainTransactionWithGas(network: string, t: PopulatedTransaction, from: string):
		Promise<CustomTransactionCallRequest> {
		const transaction = EthereumSmartContractHelper.fromTypechainTransaction(t);
		let gasLimit: string|undefined = undefined;
		try {
			gasLimit = (await this.ethersProvider(network).estimateGas(t, {from})).toString();
		} catch (e) {
			console.error('Error estimating gas for tx: ', t, e as Error);
		}
		transaction.gas.gasLimit = gasLimit!;
		return transaction;
	}

    public static callRequest(contract: string, currency: string, from: string, data: string, gasLimit: string, nonce: number,
        description: string): CustomTransactionCallRequest {
        return {
            currency,
            from,
            amount: '0',
            contract,
            data,
            gas: { gasPrice: '0', gasLimit },
            nonce,
            description,
        };
    }

    public static parseCurrency(currency: string): [string, string] {
        const ret = currency.split(':');
        ValidationUtils.isTrue(ret.length === 2, 'Invalid currency ' + currency);
        return [ret[0], ret[1]];
    }

    public static toCurrency(network: string, token: string): string {
        return `${network}:${token}`;
    }
}
