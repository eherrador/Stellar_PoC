import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import StellarSdk from "stellar-sdk";

export default class Account extends Component {
  state = {
    accountID: "", // public key
    secretSeed: "",
    balance: "",
    open: false
  };

  //Create public key and seed
  pair = StellarSdk.Keypair.random();

  createAccount = async () => {
    this.setState({ secretSeed: this.pair.secret() });
    this.setState({ accountID: this.pair.publicKey() });
    console.log(this.pair.secret());
    console.log(this.pair.publicKey());
    //console.log(encodeURIComponent(pair.publicKey()));

    //Fund the account, using the public key as the account ID
    const fetch = require("node-fetch");
    try {
      /*const response = await fetch(
        "https://horizon-testnet.stellar.org/friendbot?addr=" + pair.publicKey()
      );*/
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(
          this.pair.publicKey()
        )}`
      );
      const responseJSON = await response.json();
      console.log("SUCCESS! You have a new account :)\n", responseJSON);
    } catch (e) {
      console.error("ERROR!", e);
    }

    //Getting the account’s details and checking its balance
    const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
    const account = await server.loadAccount(this.pair.publicKey());
    this.setState({ balance: account.balances[0].balance });
    console.log("Balances for account: " + this.pair.publicKey());
    account.balances.forEach(function(balance) {
      console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
    });
  };

  getBalanceAccount = async numAccnt => {
    console.log(numAccnt);
    console.log(this.state.secretSeed);
    console.log(this.state.accountID);
    console.log(this.state.balance);
    //Getting the account’s details and checking its balance
    const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
    const account = await server.loadAccount(this.pair.publicKey());
    this.setState({ balance: account.balances[0].balance });
    console.log("Balances for account: " + this.pair.publicKey());
    account.balances.forEach(function(balance) {
      console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
    });
  };

  doTransfer = () => {
    this.setState({ open: true });
  };

  sendTransfer = () => {
    console.log(this.state.secretSeed);
    console.log("Account to send: ", this.accountToSend.value);
    console.log("Amount to send: ", this.amountToSend.value);
    
    var StellarSdk = require("stellar-sdk");
    StellarSdk.Network.useTestNetwork();
    var server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
    var sourceKeys = StellarSdk.Keypair.fromSecret(this.state.secretSeed);
    var destinationId = this.accountToSend.value;
    var amount = this.amountToSend.value;
    // Transaction will hold a built transaction we can resubmit if the result is unknown.
    var transaction;

    // First, check to make sure that the destination account exists.
    // You could skip this, but if the account does not exist, you will be charged
    // the transaction fee when the transaction fails.
    server
      .loadAccount(destinationId)
      // If the account is not found, surface a nicer error message for logging.
      .catch(StellarSdk.NotFoundError, function(error) {
        throw new Error("The destination account does not exist!");
      })
      // If there was no error, load up-to-date information on your account.
      .then(function() {
        return server.loadAccount(sourceKeys.publicKey());
      })
      .then(function(sourceAccount) {
        // Start building the transaction.
        transaction = new StellarSdk.TransactionBuilder(sourceAccount)
          .addOperation(
            StellarSdk.Operation.payment({
              destination: destinationId,
              // Because Stellar allows transaction in many currencies, you must
              // specify the asset type. The special "native" asset represents Lumens.
              asset: StellarSdk.Asset.native(),
              amount: amount
            })
          )
          // A memo allows you to add your own metadata to a transaction. It's
          // optional and does not affect how Stellar treats the transaction.
          .addMemo(StellarSdk.Memo.text("Test Transaction"))
          .setTimeout(1000)
          .build();
        // Sign the transaction to prove you are actually the person sending it.
        transaction.sign(sourceKeys);
        // And finally, send it off to Stellar!
        return server.submitTransaction(transaction);
      })
      .then(function(result) {
        console.log("Success! Results:", result);
      })
      .catch(function(error) {
        console.error("Something went wrong!", error);
        // If the result is unknown (no response body, timeout etc.) we simply resubmit
        // already built transaction:
        // server.submitTransaction(transaction);
      });
    this.setState({ open: false });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <div>
        <Tooltip title="Testnet: https://horizon-testnet.stellar.org">
          <Button
            onClick={this.createAccount}
            variant="outlined"
            color="primary"
          >
            Crear cuenta {this.props.numAccnt}
          </Button>
        </Tooltip>
        &nbsp;&nbsp;
        <Tooltip title="Obtener balance de la cuenta">
          <Button
            onClick={this.getBalanceAccount.bind(this, this.props.numAccnt)}
            variant="outlined"
            color="primary"
          >
            Balance cuenta {this.props.numAccnt}
          </Button>
        </Tooltip>
        &nbsp;&nbsp;
        <Button onClick={this.doTransfer} variant="outlined" color="primary">
          Transferir...
        </Button>
        <br />
        <TextField
          id="lblAccount"
          label="ID Cuenta"
          style={{ margin: 16, width: 700 }}
          placeholder="Ejemplo: GBOZBD2LLZVXQYXSR6KKACGYQDSG3SUPFUTLIBPRO4NC3DMFEFJ56MS4"
          helperText="Llave Pública"
          margin="dense"
          variant="outlined"
          value={this.state.accountID}
          InputLabelProps={{
            shrink: true
          }}
        />
        <TextField
          id="lblBalanceAccount"
          label="Balance Cuenta"
          style={{ margin: 16, width: 700 }}
          placeholder="Ejemplo: 10,000 lumens"
          helperText="Lumens (XLM)"
          margin="dense"
          variant="outlined"
          value={this.state.balance}
          InputLabelProps={{
            shrink: true
          }}
        />
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Realizar Transferencia
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Indique la cuenta a recibir la transferencia y el monto a enviar.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="accountToSend"
              inputRef={el => (this.accountToSend = el)}
              label="Enviar a"
              placeholder="Ejemplo: GBOZBD2LLZVXQYXSR6KKACGYQDSG3SUPFUTLIBPRO4NC3DMFEFJ56MS4"
              type="text"
              fullWidth
            />
            <TextField
              margin="dense"
              id="amountToSend"
              inputRef={el => (this.amountToSend = el)}
              label="Monto a enviar"
              placeholder="Ejemplo: 1000"
              type="number"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.sendTransfer} color="primary">
              Enviar
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
