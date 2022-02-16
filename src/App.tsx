import React from 'react';
import './App.css';
import {Button, Message} from "semantic-ui-react";

function App() {
  const account = "0x324235";
  return (
    <div className="App">
      <div className="App-header">
        <h1>Multi Sig Wallet</h1>
        <div>Account: {account}</div>

        <Message warning>Metamask is not connected</Message>
        <Button color="green">Connect to metamask</Button>
      </div>
    </div>
  );
}

export default App;
