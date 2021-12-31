import { HexString, Injectable } from "ferrum-plumbing";
import Big from 'big.js';
import { CustomTransactionCallRequest } from "unifyre-extension-sdk";
import { PopulatedTransaction } from 'ethers';
import { Eth } from "web3-eth";
export declare type Web3ProviderConfig = {
    [network: string]: string;
};
export declare class Web3Utils {
    static TRANSACTION_TIMEOUT: number;
    static DEFAULT_APPROVE_GAS: number;
    static isZeroAddress(val: string): boolean;
    static zX(str: string): string;
}
export declare function tryWithBytes32(web3: any, name: string, address: string, fun: () => Promise<any>): Promise<any>;
export declare type EthereumTransactionStatus = 'timedout' | 'failed' | 'pending' | 'successful';
export interface EthereumTransactionSummary {
    network: string;
    id: string;
    status: EthereumTransactionStatus;
    confirmationTime: number;
    confirmations: number;
}
export declare class EthereumSmartContractHelper implements Injectable {
    private provider;
    private cache;
    constructor(provider: Web3ProviderConfig);
    __name__(): string;
    getTransactionStatus(network: string, tid: string, submissionTime: number): Promise<EthereumTransactionStatus | undefined>;
    getTransactionSummary(network: string, tid: string, submissionTime?: number): Promise<EthereumTransactionSummary | undefined>;
    blockByNumber(network: string, blockNo: number): Promise<import("web3-eth").BlockTransactionObject>;
    approveMaxRequests(currency: string, approver: string, value: string, approvee: string, approveeName: string, nonce?: number): Promise<[number, CustomTransactionCallRequest[]]>;
    approveRequests(currency: string, approver: string, value: string, approvee: string, approveeName: string, nonce?: number): Promise<[number, CustomTransactionCallRequest[]]>;
    private _approveRequests;
    private addApprovesToRequests;
    approveToZero(currency: string, from: string, approvee: string): Promise<[HexString, number]>;
    approve(currency: string, from: string, rawAmount: Big, approvee: string, useThisGas: number): Promise<[HexString, number]>;
    approveMax(currency: string, from: string, approvee: string, useThisGas: number): Promise<[HexString, number]>;
    currentAllowance(currency: string, from: string, approvee: string): Promise<Big>;
    amountToMachine(currency: string, amount: string): Promise<string>;
    amountToHuman(currency: string, amount: string): Promise<string>;
    symbol(currency: string): Promise<string>;
    decimals(currency: string): Promise<number>;
    name(currency: string): Promise<string>;
    erc20(network: string, token: string): import("web3-eth-contract").Contract;
    gasPrice(network: string): Promise<string>;
    private _web3;
    web3Eth(network: string): Eth;
    web3(network: string): Eth;
    ethersProvider(network: string): any;
    static fromTypechainTransaction(t: PopulatedTransaction): CustomTransactionCallRequest;
    fromTypechainTransactionWithGas(network: string, t: PopulatedTransaction, from: string): Promise<CustomTransactionCallRequest>;
    static callRequest(contract: string, currency: string, from: string, data: string, gasLimit: string, nonce: number, description: string): CustomTransactionCallRequest;
    static parseCurrency(currency: string): [string, string];
    static toCurrency(network: string, token: string): string;
}
//# sourceMappingURL=EthereumSmartContractHelper.d.ts.map