import React from 'react';
import './App.css';
import {Button, Message} from "semantic-ui-react";
import {useWeb3Context} from "./contexts/Web3";
import {unlockAccount} from "./api/web3";
import useAsync from "./components/useAsync";
import {useMultiSigWalletContext} from "./contexts/MultiSigWallet";
import DepositForm from "./DepositForm";

function App() {
  const {
    state: {account, web3},
    updateAccount
  } = useWeb3Context();
  const {
    state: {
      address,
      balance,
      owners,
      numConfirmationsRequired,
      transactionCount,
      transactions
    },
  } = useMultiSigWalletContext();

  const {pending, error, call} = useAsync(unlockAccount);

  async function onClickConnect() {
    const {error, data} = await call(null);
    if (error) {
      console.error(error);
    }
    if (data) {
      updateAccount(data);
    }
  }

  return (
      <div className="App">
        <div className="App-header">
          <h1>Multi Sig Wallet</h1>
          <div>Account: {account}</div>
          <div>Contract: {address}</div>
          <div>Owners:
            <ul>
              {owners.map(owner => <li>{owner}</li>)}
            </ul>
          </div>
          <div>balance: {balance}</div>
          <hr/>
          <DepositForm/>
          <hr/>
          <div>confirmations required: {numConfirmationsRequired}</div>
          {!web3 &&
            <Message warning>Metamask is not connected</Message>
          }
          <Button
              color="green"
              onClick={() => onClickConnect()}
              disabled={pending}
              loading={pending}
          >
            Connect to metamask
          </Button>
        </div>
      </div>
  );
}

export default App;
