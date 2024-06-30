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
exports.EthereumSmartContractHelper = exports.tryWithBytes32 = exports.Web3Utils = void 0;
const ferrum_plumbing_1 = require("ferrum-plumbing");
const IERC20_json_1 = __importDefault(require("./resources/IERC20.json"));
const web3_1 = __importDefault(require("web3"));
const big_js_1 = __importDefault(require("big.js"));
const ethers_1 = require("ethers");
const PROVIDER_TIMEOUT = 1000 * 3600;
const BLOCK_CACH_TIMEOUT = 1000 * 360;
const MAX_AMOUNT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
class Web3Utils {
    static isZeroAddress(val) {
        return !val || !val.replace(/[0xX]*/, '').length;
    }
    static zX(str) {
        if (str.startsWith('0x')) {
            return str;
        }
        return str;
    }
}
exports.Web3Utils = Web3Utils;
Web3Utils.TRANSACTION_TIMEOUT = 36 * 1000;
Web3Utils.DEFAULT_APPROVE_GAS = 60000;
function tryWithBytes32(web3, name, address, fun) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fun();
        }
        catch (e) {
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
            const val = yield cont.methods[name]().call();
            return web3_1.default.utils.hexToUtf8(val);
        }
    });
}
exports.tryWithBytes32 = tryWithBytes32;
;
class EthereumSmartContractHelper {
    constructor(provider) {
        this.provider = provider;
        this.cache = new ferrum_plumbing_1.LocalCache();
    }
    __name__() { return 'EthereumSmartContractHelper'; }
    getTransactionStatus(network, tid, submissionTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const ts = yield this.getTransactionSummary(network, tid, submissionTime);
            return ts ? ts.status : undefined;
        });
    }
    getTransactionSummary(network, tid, submissionTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const web3 = this.web3(network);
            const t = yield web3.getTransaction(tid);
            if (!t) {
                return undefined;
            }
            if (!t && !!submissionTime &&
                ((submissionTime + Web3Utils.TRANSACTION_TIMEOUT) < Date.now())) {
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
                };
            }
            const receipt = yield web3.getTransactionReceipt(tid);
            const status = !!receipt.status ? 'successful' : 'failed';
            const block = yield web3.getBlockNumber();
            const txBlock = yield this.blockByNumber(network, t.blockNumber);
            return {
                network, id: tid,
                confirmationTime: Number(txBlock.timestamp || '0') * 1000,
                confirmations: (block - txBlock.number) + 1,
                status,
            };
        });
    }
    blockByNumber(network, blockNo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.cache.getAsync(`BLOCK_BY_NO:${network}/${blockNo}`, () => __awaiter(this, void 0, void 0, function* () {
                    const web3 = this.web3(network);
                    const block = yield web3.getBlock(blockNo, false);
                    return block;
                }), BLOCK_CACH_TIMEOUT);
            }
            catch (e) {
                throw new Error(`Error calling getBlock(${blockNo}) for ${network}: ${e}`);
            }
        });
    }
    approveMaxRequests(currency, approver, value, approvee, approveeName, nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._approveRequests(currency, approver, value, approvee, approveeName, true, nonce);
        });
    }
    approveRequests(currency, approver, value, approvee, approveeName, nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._approveRequests(currency, approver, value, approvee, approveeName, false, nonce);
        });
    }
    _approveRequests(currency, approver, value, approvee, approveeName, maxAmount, nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            ferrum_plumbing_1.ValidationUtils.isTrue(!!approver, "'approver' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!approvee, "'approvee' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!approveeName, "'approveeName' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!currency, "'currency' must be provided");
            ferrum_plumbing_1.ValidationUtils.isTrue(!!value, "'value' must be provided");
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            const tokDecimalFactor = Math.pow(10, yield this.decimals(currency));
            const amount = new big_js_1.default(value).times(new big_js_1.default(tokDecimalFactor));
            nonce = nonce || (yield this.web3(network).getTransactionCount(approver, 'pending'));
            const amountHuman = amount.div(tokDecimalFactor).toString();
            const symbol = yield this.symbol(currency);
            let requests = [];
            return yield this.addApprovesToRequests(requests, nonce, amount, amountHuman, token, symbol, currency, approver, approvee, approveeName, maxAmount);
        });
    }
    addApprovesToRequests(requests, nonce, amount, amountHuman, token, symbol, currency, address, approvee, approveeName, useMax) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentAllowance = yield this.currentAllowance(currency, address, approvee);
            if (currentAllowance.lt(amount)) {
                let approveGasOverwite = 0;
                if (currentAllowance.gt(new big_js_1.default(0))) {
                    const [approveToZero, approveToZeroGas] = yield this.approveToZero(currency, address, approvee);
                    requests.push(EthereumSmartContractHelper.callRequest(token, currency, address, approveToZero, approveToZeroGas.toString(), nonce, `Zero out the approval for ${symbol} by ${approveeName}`));
                    nonce++;
                    approveGasOverwite = approveToZeroGas;
                }
                const [approve, approveGas] = useMax ? yield this.approveMax(currency, address, approvee, approveGasOverwite) :
                    yield this.approve(currency, address, amount, approvee, approveGasOverwite);
                requests.push(EthereumSmartContractHelper.callRequest(token, currency, address, approve, approveGas.toString(), nonce, `Approve ${useMax ? 'max' : amountHuman} ${symbol} to be spent by ${approveeName}`));
                nonce++;
            }
            return [nonce, requests];
        });
    }
    approveToZero(currency, from, approvee) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            const m = this.erc20(network, token).methods.approve(approvee, '0');
            const gas = yield m.estimateGas({ from });
            return [m.encodeABI(), gas];
        });
    }
    approve(currency, from, rawAmount, approvee, useThisGas) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            console.log('about to approve: ', { from, token, approvee, amount: rawAmount.toFixed(), });
            const m = this.erc20(network, token).methods.approve(approvee, rawAmount.toFixed());
            const gas = !!useThisGas ? Math.max(useThisGas, Web3Utils.DEFAULT_APPROVE_GAS) : yield m.estimateGas({ from });
            return [m.encodeABI(), gas];
        });
    }
    approveMax(currency, from, approvee, useThisGas) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            console.log('about to approve max: ', { from, token, approvee });
            const m = this.erc20(network, token).methods.approve(approvee, MAX_AMOUNT);
            const gas = !!useThisGas ? Math.max(useThisGas, Web3Utils.DEFAULT_APPROVE_GAS) :
                yield m.estimateGas({ from });
            return [m.encodeABI(), gas];
        });
    }
    currentAllowance(currency, from, approvee) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            const allowance = yield this.erc20(network, token).methods.allowance(from, approvee).call();
            const bAllownace = new big_js_1.default(allowance.toString());
            console.log('current allowance is ', bAllownace.toString(), ' for ', approvee, 'from', from);
            return bAllownace;
        });
    }
    amountToMachine(currency, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const decimal = yield this.decimals(currency);
            const decimalFactor = Math.pow(10, decimal);
            return new big_js_1.default(amount).times(decimalFactor).toFixed(0);
        });
    }
    amountToHuman(currency, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const decimal = yield this.decimals(currency);
            const decimalFactor = Math.pow(10, decimal);
            return new big_js_1.default(amount).div(decimalFactor).toFixed();
        });
    }
    symbol(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            return this.cache.getAsync('SYMBOLS_' + currency, () => __awaiter(this, void 0, void 0, function* () {
                const tokenCon = this.erc20(network, token);
                return tryWithBytes32(this.web3(network), 'symbol', token, () => __awaiter(this, void 0, void 0, function* () { return yield tokenCon.methods.symbol().call(); }));
            }));
        });
    }
    decimals(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            if (EthereumSmartContractHelper.isBaseCurrency(currency)) {
                return 18;
            }
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            return this.cache.getAsync('DECIMALS_' + currency, () => {
                const tokenCon = this.erc20(network, token);
                return tokenCon.methods.decimals().call();
            });
        });
    }
    name(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const [network, token] = EthereumSmartContractHelper.parseCurrency(currency);
            try {
                return this.cache.getAsync('NAME_' + currency, () => {
                    const tokenCon = this.erc20(network, token);
                    return tokenCon.methods.name().call();
                });
            }
            catch (e) {
                return '';
            }
        });
    }
    erc20(network, token) {
        const web3 = this.web3(network);
        return new web3.Contract(IERC20_json_1.default, token);
    }
    gasPrice(network) {
        const web3 = this.web3(network);
        return web3.getGasPrice();
    }
    _web3(network) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.provider[network], 'No provider is configured for ' + network);
        const key = 'PROVIDER_' + network;
        let prov = this.cache.get(key);
        if (!prov) {
            prov = new web3_1.default(new web3_1.default.providers.HttpProvider(this.provider[network]));
            this.cache.set(key, prov, PROVIDER_TIMEOUT);
        }
        return prov;
    }
    web3Eth(network) {
        return this.web3(network);
    }
    web3(network) {
        return (this._web3(network) || {}).eth;
    }
    ethersProvider(network) {
        ferrum_plumbing_1.ValidationUtils.isTrue(!!this.provider[network], 'No provider is configured for ' + network);
        const key = 'PROVIDER_ETHERS_' + network;
        let prov = this.cache.get(key);
        if (!prov) {
            prov = new ethers_1.ethers.providers.Web3Provider(this.web3(network).currentProvider);
            this.cache.set(key, prov, PROVIDER_TIMEOUT);
        }
        return prov;
    }
    static fromTypechainTransaction(t) {
        return {
            amount: '',
            gas: {
                gasLimit: (t.gasLimit || '').toString(),
                gasPrice: (t.gasPrice || '').toString(),
            },
            contract: t.to,
            currency: '',
            data: t.data,
            from: t.from,
            description: ``,
            nonce: t.nonce,
            value: t.value,
        };
    }
    fromTypechainTransactionWithGas(network, t, from) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = EthereumSmartContractHelper.fromTypechainTransaction(t);
            let gasLimit = undefined;
            try {
                gasLimit = (yield this.ethersProvider(network).estimateGas(t, { from })).toString();
            }
            catch (e) {
                console.error('Error estimating gas for tx: ', t, e);
            }
            transaction.gas.gasLimit = gasLimit;
            return transaction;
        });
    }
    static callRequest(contract, currency, from, data, gasLimit, nonce, description) {
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
    static parseCurrency(currency) {
        const ret = currency.split(':');
        ferrum_plumbing_1.ValidationUtils.isTrue(ret.length === 2, 'Invalid currency ' + currency);
        return [ret[0], ret[1]];
    }
    static toCurrency(network, token) {
        return `${network}:${token}`;
    }
    static isBaseCurrency(currency) {
        const tok = currency.split(':')[1];
        return !!tok && !tok.startsWith('0x');
    }
}
exports.EthereumSmartContractHelper = EthereumSmartContractHelper;
//# sourceMappingURL=EthereumSmartContractHelper.js.map