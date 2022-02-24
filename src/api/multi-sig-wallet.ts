import TruffleContract from '@truffle/contract';
import multiSigWalletTruffle from '../build/contracts/MultiSigWallet.json';
import Web3 from "web3";
import BN from "bn.js";

// @ts-ignore
const MultiSigWallet = TruffleContract(multiSigWalletTruffle);

interface Transaction {
  txIndex: number;
  to: string;
  value: BN;
  data: string;
  executed: boolean;
  numConfirmations: number;
  isConfirmedByCurrentAccount: boolean;
}

interface GetResponse {
  address: string;
  balance: string;
  owners: string[];
  numConfirmationsRequired: number;
  transactionCount: number;
  transactions: Transaction[];
}

export async function get(web3: Web3, account: string): Promise<GetResponse> {
  MultiSigWallet.setProvider(web3.currentProvider);
  const multiSigWallet = await MultiSigWallet.deployed();
  const owners = await multiSigWallet.getOwners();
  const numConfirmationsRequired = await multiSigWallet.numConfirmationsRequired();
  const transactionCount = await multiSigWallet.getTransactionCount();
  const balance = await web3.eth.getBalance(multiSigWallet.address);
  const count = transactionCount.toNumber();
  const transactions: Transaction[] = [];
  for (let i = 0; i < 10; i++) {
    const txIndex = count - 1;
    if (txIndex < 0) {
      break;
    }
    const tx = await multiSigWallet.getTransaction(txIndex);
    const isConfirmed = await multiSigWallet.isConfirmed(txIndex, account)
    transactions.push({
      txIndex,
      to: tx.to,
      value: tx.value,
      data: tx.data,
      executed: tx.executed,
      numConfirmations: tx.numConfirmations,
      isConfirmedByCurrentAccount: isConfirmed
    });
  }
  return {
    address: multiSigWallet.address,
    balance,
    owners,
    numConfirmationsRequired: numConfirmationsRequired.toNumber(),
    transactionCount: count,
    transactions
  };
}

export async function deposit(
    web3: Web3,
    account: string,
    params: {
      value: BN
    }
) {
  MultiSigWallet.setProvider(web3.currentProvider);
  const multiSig = await MultiSigWallet.deployed();
  await multiSig.sendTransaction({
    from: account,
    value: params.value
  })
}

export async function subscribe(
    web3: Web3,
    address: string,
    callback: (error: Error | null, log: Log | null) => void
) {
  const multiSig = new web3.eth.Contract(MultiSigWallet.abi, address);
  const res = multiSig.events.allEvents((error: Error, log: Log) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, log);
    }
  });

  return () => res.unsubscribe();
}

interface Deposit {
  event: "Deposit",
  returnValues: {
    sender: string;
    amount: string;
    balance: string;
  }
}

type Log = Deposit;

export async function submitTx(
    web3: Web3,
    account: string,
    params: {
      to: string,
      value: string,
      data: string
    }
) {
  MultiSigWallet.setProvider(web3.currentProvider);
  const multiSig = await MultiSigWallet.deployed();
  const {to, value, data} = params;
  multiSig.submitTransaction(to, value, data, {from: account});
}