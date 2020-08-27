import React from 'react';
import ReactDOM from 'react-dom';
import "./app.css";

import Banner from "./components/Banner.js";
import Home from "./components/pages/Home.js";
import Deposit from "./components/pages/Deposit.js";
import SignOut from "./components/pages/SignOut.js";
import Backup from "./components/pages/Backup.js";
import Withdraw from "./components/pages/Withdraw.js";
import Wallet from "./components/pages/Wallet.js";
import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

const monerojs = require("monero-javascript");
const LibraryUtils = monerojs.LibraryUtils;
const MoneroWalletListener = monerojs.MoneroWalletListener;
const MoneroWallet = monerojs.MoneroWallet;

const XMR_AU_RATIO = 0.000000000001;

class App extends React.Component {
  constructor(props) {
    super(props);
    
    // Class vars
    this.keysModuleLoaded = false;
    this.wasmModuleLoaded = false;
    
    // In order to pass "this" into the nested functions...
    let that = this;
    
    //Start loading the Keys-only and Wasm wallet modules
    LibraryUtils.loadKeysModule().then(
      function() {
	that.keysModuleLoaded = true;
	alert("Keys module loaded!");
	// Load the core module
	LibraryUtils.loadCoreModule().then(
	  function() {
	    that.coreModuleLoaded = true;
	    alert("Core module loaded!");
	    // Load the core module
	  }
	).catch(
	  function(error) {
	    alert("Failed to load core wallet module!");
	  } 
	);
      }
    ).catch(
      function(error) {
	alert("Failed to load keys-only wallet module!");
	alert("Error: " + error);
      } 
    );
    
    LibraryUtils.loadCoreModule();

    this.state = {
      /*
       * The mnemonic phrase (or portion thereof) that the user has typed into
       * either the "confirm" or "restore" wallet text box
       */
      enteredPhrase: "",
      wallet: null,
      walletPhrase: "",
      phraseIsConfirmed: false,
      walletSyncProgress: 0,
      restoreHeight: 0,
      walletIsSynced: false,
      balance: 0,
      availableBalance: 0
      
    };
  }
  
  setBalances(balance, availableBalance){
    alert("Balance before conversion: " + balance);
    this.setState({
      balance: balance * XMR_AU_RATIO,
      availableBalance: availableBalance * XMR_AU_RATIO
    });
    alert("Balance after conversion: " + balance * XMR_AU_RATIO);
  }
  
  convertStringToRestoreDate(str){
    // Make sure the string is of the format "####/##/##"
    // Does the date have the correct number of characters? (10):
    console.log("attempting to convert " + str + " to a restore height");
    console.log(str + " has " + str.length + " chars; should be 10!");
    if(str.length === 10){
      //Attempt to divide the string into its constituent parts
      var dateParts = str.split("/");
      alert("This is dateparts: " + dateParts);
      // If the result yields three strings
      if (dateParts.length === 3){
	// Attempt to convert each string to an integer
	for (let i = 0; i < 3; i++){
	  try {
	    let n = Number(dateParts[i]);
	    if (n === NaN) throw "Invalid date";
	    // If the conversion worked, replace the string in the array with the number
	    dateParts[i] = n;
	  } catch(e){
	    throw "Invalid date: " + e;
	  }
	}
	alert("returning dateparts as: " + dateParts);
	return dateParts;
      } else throw "Invalid date; date should contain three numbers separated by two slashes";
    }
    throw "Invalid date; date should be 10 chars long";
  }
  
  setRestoreHeight(height){
    this.setState({
      restoreHeight: height
    });
  }
  
  async restoreWallet(browserHistory){
    
    let alertMessage = "";  
    
    //First, determine whether the user has typed at height, a date, or something else(invalid)
    let height=Number(this.state.restoreHeight);
    // If the string is NOT a valid integer, check to see if it is a date and convert accordingly:
    if(!(height != NaN && height%10 === 0)) {
      // Attempt to convert the string to a date in the format "YYYY/MM/DD"
      try{
	var dateParts = this.convertStringToRestoreDate(this.state.restoreHeight);
	
	// THIS IS TEMPORARY
	// getHeightByDate is an instance function but should be a CLASS function
	// Until this is fixed, the only way to run the function is to create a 
	// temporary dummy wallet
	let walletWasm = await monerojs.createWalletWasm({
	  password: "supersecretpassword123",
	  networkType: "stagenet",
	  path: "",
	  serverUri: "http://localhost:38081",
	  serverUsername: "superuser",
	  serverPassword: "abctesting123",
	});
	
	// Attempt to convert date into a monero blockchain height:
	height = await walletWasm.getHeightByDate(dateParts[0], dateParts[1], dateParts[2]);
      } catch(e) {
	alertMessage = "Well poop!\n" + e;
      }
    } 
    
    // If no errors were thrown, "height" is a valid restore height.
    if(alertMessage !== "") {
      alert(alertMessage);
      return;
    } else {
      alert("Valid restore height!");
    }
    
    let walletWasm = null;
    try {
      walletWasm = await monerojs.createWalletWasm({
        password: "supersecretpassword123",
        networkType: "stagenet",
        path: "",
        serverUri: "http://localhost:38081",
        serverUsername: "superuser",
        serverPassword: "abctesting123",
        mnemonic: this.state.enteredPhrase,
        restoreHeight: height
      });
    } catch(e) {
      alert("Invalid mnemonic!");
      alert("Error: " + e);
      return;
    }
    browserHistory.push("/home/synchronize_wallet");
    await this.synchronizeWallet(walletWasm);
    this.setState ({
      wallet: walletWasm
    });
  }

setCurrentSyncProgress(percentDone){
this.setState({walletSyncProgress: percentDone});
}
  
  setEnteredPhrase(mnemonic){
    this.setState({
      enteredPhrase: mnemonic
    });
  }

  async generateWallet(){
    let walletWasm = await monerojs.createWalletWasm({
      password: "supersecretpassword123",
      networkType: "stagenet",
      path: "",
      serverUri: "http://localhost:38081",
      serverUsername: "superuser",
      serverPassword: "abctesting123",
    });
    let newPhrase = await walletWasm.getMnemonic();
    this.setState ({
      wallet: walletWasm,
      walletPhrase: newPhrase
    });
  }
  


  deleteWallet() {
    this.setState ({
      wallet: null,
      walletPhrase: "",
      enteredPhrase: "",
      phraseIsConfirmed: false,
      walletSyncProgress: 0,
      balance: 0,
      availableBalance: 0
    })
  }
  
  async confirmWallet(browserHistory) {
    let walletPhrase = await this.state.wallet.getMnemonic();
    if (this.state.enteredPhrase === walletPhrase) {
      this.setState ({
        phraseIsConfirmed: true
      });
      browserHistory.push("/home/synchronize_wallet");
      await this.synchronizeWallet(wallet);
    } else {
      alert("The phrase you entered does not match the generated mnemonic! Re-enter the phrase or go back to generate a new wallet.");
    }

  }
  
  //Called when the user clicks "continue" after entering a valid new (for restore) or confirm (for create new) seed phrase.
  async synchronizeWallet(wallet) {
    this.walletUpdater = new walletListener(this);
    let result = await wallet.sync(this.walletUpdater);  // synchronize and print progress
    this.walletUpdater.setWalletIsSynchronized(true);
    alert("Balance before conversion: " + await wallet.getBalance);
    let balance = await wallet.getBalance() * XMR_AU_RATIO;
    let availableBalance = await wallet.getUnlockedBalance() * XMR_AU_RATIO;
    alert("Balance after conversion: " + balance);
    this.setState({
      walletIsSynced: true,
      balance: balance,
      availableBalance: availableBalance
    })
  }


  render(){
    const homeRoute = this.state.walletIsSynced ? 
      <Route path="/home" render={() => <Wallet
        balance={this.state.balance}
        availableBalance={this.state.availableBalance}
      />} />
    :
      <Route path="/home" render={() => <Home
        generateWallet={this.generateWallet.bind(this)}
        confirmWallet={this.confirmWallet.bind(this)}
        restoreWallet={this.restoreWallet.bind(this)}
        setEnteredPhrase={this.setEnteredPhrase.bind(this)}
        deleteWallet={this.deleteWallet.bind(this)}
        walletSyncProgress = {Math.trunc(this.state.walletSyncProgress)}
        setRestoreHeight = {this.setRestoreHeight.bind(this)}
        walletPhrase = {this.state.walletPhrase}
      />} />
      
    return(
      <div id="app_container">
        <Router>
          <Banner walletIsSynced={this.state.walletIsSynced}/>
          <Switch>
            <Route exact path="/" render={() => {
              return(
                <Redirect to="/home" />
              );
            }} />
            {homeRoute}
            <Route path="/backup" render={(props) => <Backup
              {...props}
            />} />
            <Route path="/deposit" render={(props) => <Deposit
              {...props}
            />} />
            <Route path="/sign_out" render={(props) => <SignOut
              {...props}
            />} />
            <Route path="/withdraw" render={(props) => <Withdraw
              {...props}
            />} />
            <Route component={default_page} />
          </Switch>
        </Router>
      </div>
    );
  }
}

function default_page(){
  return <h1>ERROR - invalid url path!</h1>
}
            
/**
 * Print sync progress every X blocks.
 */
class walletListener extends MoneroWalletListener {
              
  constructor(callingComponent) { // callingComponent is "App" in this case
    super();
    this.callingComponent = callingComponent;
    this.syncResolution = 0.05;
    this.lastIncrement = 0;
    this.walletIsSynchronized = false;
  }
              
  onSyncProgress(height, startHeight, endHeight, percentDone, message) {
    //let percentString = Math.floor(parseFloat(percentDone) * 100).toString() + "%";
    //$("#progressBar").width(percentString);
    this.callingComponent.setCurrentSyncProgress(percentDone*100); 
    if (percentDone >= this.lastIncrement + this.syncResolution) {
      this.lastIncrement += this.syncResolution;
    }
  }
  onBalancesChanged(newBalance, newUnlockedBalance){
    if (this.walletIsSynchronized)
      this.callingComponent.setBalances(newBalance, newUnlockedBalance); 
  }
  
  setWalletIsSynchronized(value) {
    this.walletIsSynchronized = value;
  }
}

export default App;
