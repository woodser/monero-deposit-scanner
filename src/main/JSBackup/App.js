import React, {useState, useRef, useEffect} from 'react';

import {SubmitButton} from "./Components/MoneroButtons.tsx";
import LoadingAnimation from "./Components/LoadingAnimation.tsx";
import "./app.css";
//import moneroLogo from "./img/logo.png";
import PageBox from "./Components/PageBox";
import DepositViewerTextEntryField from "./Components/DepositViewerTextEntryField.tsx";
import VerticallyCenteredItemContainer from "./Components/VerticallyCenteredItemContainer.js"
import MoneroLogo from "./img/MoneroLogo.png";
import TitleBar from "./Components/TitleBar.js";
import { xmrToAtomicUnits } from 'monero-javascript/src/main/js/common/MoneroUtils';
import { WORKER_DIST_PATH_DEFAULT } from 'monero-javascript/src/main/js/common/LibraryUtils';
import ProgressBar from "./Components/ProgressBar";
import TransactionTable from "./Components/TransactionTable.js";

const monerojs = require("monero-javascript");
const MoneroUtils = monerojs.MoneroUtils;
const LibraryUtils = monerojs.LibraryUtils;
const MoneroWalletListener = monerojs.MoneroWalletListener;
//const MoneroWallet = monerojs.MoneroWallet;
//const MoneroRpcConnection = monerojs.MoneroRpcConnection;
const MoneroNetworkType = monerojs.MoneroNetworkType;


export default function App(props){
  
  //DEBUG!
  const TARGET_NODE = "opennode.xmr-tw.org:18089";
  
  const PAGE_BOX_WIDTH = "1024px";
  const PAGE_BOX_COLOR = "#f2be00";
  
  const TITLE = "Monero deposit viewer";
  const DESCRIPTION = 
    <div className = "description">
      <a href = "http://github.com/woodser/monerotxviewer">Open-source</a>
      , client-side transaction scanner to view incoming deposits to a Monero wallet
    </div>
  const WALLET_INFO = {
        password: "supersecretpassword123",
        networkType: "mainnet",
        serverUri: "134.122.121.42:85/",
      }
  
  // State
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  
  const [walletAddress, setWalletAddress] = useState(null);
  const [viewkey, setViewkey] = useState(null);
  const [restoreHeight, setRestoreHeight] = useState(0)
  const [dateConversionWalletIsLoaded, setDateConversionWalletIsLoaded] = useState(false);

  const [buttonState, setButtonState] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);

  const [transactionList, setTransactionList] = useState([]);

  const addressIsValid = useRef(false);
  const viewKeyIsValid = useRef(false);
  const restoreHeightIsValid = useRef(false);
  const wallet = useRef(null);
  const dateConversionWallet = useRef(null);
    
  // This function is purely for testing!
  const currentStep = useRef(0);
  
  const addTransaction = function(transaction){
    setTransactionList(transactionList.concat(transaction));
    console.log("New transaction list: " + transactionList);
  }
  /* 
   * monero-javascript returns transaction datetimes in the form of an integer representing
   * the number of milliseconds that have passed since te epoch.
   * The spec requires dates to be displayed in the format:
   * YYYY-MM-DD HH:MM:SS UTC
   */
   const convertMillisecondsToFormattedDateString = function(t){
     let date = new Date(t);
     return(
       date.getUTCFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate() + " " + 
       date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds() + " UTC"
     )
   }
   
  /*
  const testSubmitButtonDisplay = function(){
    
    currentStep.current++;
    console.log("runnin testSubmitButtonDisplay; currentStep: " + currentStep.current);
    
	  switch(currentStep.current) {
	    case 1:
        addressIsValid.current = true;
        viewKeyIsValid.current = true;
        restoreHeightIsValid.current = true;
        setButtonState(1);
        break;
      case 2:
        setButtonState(2);
        break;
      case 3:
        setButtonState(3);
        setSyncProgress(1);
        addTransaction(generateRandomTransaction());
        break;
      case 4:
        setSyncProgress(25);
        addTransaction(generateRandomTransaction());
        break;
      case 5:
        setSyncProgress(50);
        addTransaction(generateRandomTransaction());
        addTransaction(generateRandomTransaction());
        break;
      case 6:
        setSyncProgress(75);
        break;
      case 7:
        setSyncProgress(99);
        setButtonState(4);
        addTransaction(generateRandomTransaction());
        break;
      case 8: 
        setButtonState(4);
        setSyncProgress(100);
        break;
      case 9:
        currentStep.current = 0;
        addressIsValid.current = false;
        viewKeyIsValid.current = false;
        restoreHeightIsValid.current = false;
        setButtonState(0);
        setSyncProgress(0);
      default:
        console.log("Switch defaulted on its loan ;)");
	  }
  }	
  */
  
   const createDateConversionWallet = async function(){
    // Create a disposable,random wallet to prepare for the possibility that the user will attempt to restore from a date
    // At present, getRestoreHeightFromDate() is (erroneously) an instance method; thus, a wallet instance is
    // required to use it.
    let dateWallet;
    try {
      console.log("Attempting to create wallet");
      
      dateWallet = await monerojsExplicitImport.createWalletFull(WALLET_INFO);
    } catch(e){
      throw("Date wallet creation failed: " + e);
    }
    console.log("date wallet created");
    setDateConversionWalletIsLoaded(true);
    return dateWallet;
  }
  
  const resetApp = function() {
    /*
      const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [viewkey, setViewkey] = useState(null);
  const [restoreHeight, setRestoreHeight] = useState(0)
  const [dateConversionWalletIsLoaded, setDateConversionWalletIsLoaded] = useState(false);
  const [buttonState, setButtonState] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);

  const addressIsValid = useRef(false);
  const viewKeyIsValid = useRef(false);
  const restoreHeightIsValid = useRef(false);
  const wallet = useRef(null);
  const dateConversionWallet = useRef(null);
    */
    
    setBalance(0);
    setWalletAddress(0);
    setViewKey(0);
    setRestoreHeight(0);
    //setDateConversionWalletIsLoaded(false);
    setButtonState(0);
    setSyncProgress(0);
    
    addressIsValid.current = false;
    viewKeyIsValid.current = false;
    restoreHeightIsValid.current = false;
    wallet.current = null;
    //dateConversionWallet.current = null;
  }
  
  // Will probably be removed - not sure this serves any purpose in this app
  const loadKeysModule = async function() {
    try {
      await LibraryUtils.loadKeysModule();
    } catch(e) {
      throw(e);
    }
  }
  
  const loadFullModule = async function() {
    try {
      await LibraryUtils.loadFullModule();
    } catch(e) {
      throw(e);
    }
  }
  
  useEffect(function() {
    
    async function loadPreRequisites(){
      
      try {
        await loadFullModule();
      } catch(e) {
        console.log(e);
        return;
      }
      
      try {
        dateConversionWallet.current = await createDateConversionWallet();
      } catch(e) {
        console.log(e);
        return;
      }
      
      console.log("Finished loading prereqs");
      //setInterval(testSubmitButtonDisplay, 5000);
    }
    
    loadPreRequisites();
  }, []);
  
  const setBalances = function(balance){
    setBalance(balance);
  }

  const setCurrentSyncProgress = function(percentDone){
    setWalletSyncProgress(percentDone);
  }
  
  const startScanning = function() {
    console.log("You pressed da button!");
  }

  /**
   * Common helper to initialize the main page after the wallet is created and synced.
   *
   * Creates the tx generator, listens for event notifications, and starts background synchronization.
   */
  const _initMain = async function(){
    
    // resolve wallet promise
    // TODO (woodser): create new wallet button needs greyed while this loads
    let wallet = await wallet;

    // If the user hit "Or go back" before the wallet finished building, abandon wallet creation
    // and do NOT proceed to wallet page
    if (this.userCancelledWalletConfirmation) return;
    
    // register listener to handle balance notifications
    // TODO: register once wherever is appropriate, but need to update state with updated balances from wallet listener
    await wallet.addListener(new class extends MoneroWalletListener {
      async onBalancesChanged(newBalance, newUnlockedBalance) {
        console.log("wallet.onBalancesChanged(" + newBalance.toString() + ", " + newUnlockedBalance.toString() + ")");
        that.setState({
          balance: newBalance,
          availableBalance: newUnlockedBalance
        });
      }
    });
    
    // start syncing wallet in background if the user has not cancelled wallet creation.
    await wallet.startSyncing();
  }
  
  const validateAddress = function(address){
    return MoneroUtils.isValidAddress(address, MoneroNetworkType.MAINNET);
  }
  const validateViewKey = function(viewKey){
    try {
      MoneroUtils.validatePrivateViewKey(viewKey);
    } catch (e){
      return false;
    }
    return true;
  } 
  const validateRestoreHeight = function(height){
    console.log("Validating restore height");
  }
  
  const changeRestoreHeightText = function(restoreHeight, setEnteredTextIsValid){
    console.log("Changing restore height");
  }
  
  /* Extracts the nuances of determining how to create the submit button under current circumstances from the main function
   * in order to maintain cleaner code
   */
  const createButtonElement = function(){
    let handleSubmit;
    let showLoadingWheel = false;
    let buttonMessage = "";
    
    /*
     * isActive is false if the user-entered data (address, height, etc.) has not yet satisfied requirements.
     * It causes the button to be "grayed out"
     */
    let isActive = false;
    //Creating a variable for the button element makes it possible to construct the button programmatically/conditionally
    let buttonElement;
    
    console.log("ButtonState: " + buttonState);
    if(buttonState === 4){
      handleSubmit = resetApp;
      buttonMessage = "View deposits to a different wallet";
      isActive = true;
    } else if (buttonState === 3) {
      showLoadingWheel = true;
      buttonMessage = "Scanning (" + syncProgress + ")"
    } else if (buttonState === 2){
      buttonMessage = "Starting scan";
    } else if (buttonState === 1){
      buttonMessage = "View incoming deposits";
      handleSubmit = startScanning;
      isActive = true;
    } else {
      buttonMessage = "View incoming deposits";
    }
    
    let image;
    if(showLoadingWheel){
      image = <LoadingAnimation />
    } 
    
    let showProgressBar = false;
    if(syncProgress > 0 && syncProgress < 100) {
      showProgressBar = true;
    }
    
    return (
      <SubmitButton 
        progress = {syncProgress}
        message = {buttonMessage}
        image = {image}
        showProgressBar = {showProgressBar}
        action = {handleSubmit}
        isActive = {isActive}
      />
    )
  }
  
  if(dateConversionWalletIsLoaded){
    let buttonElement = createButtonElement();
    /* Vars that affect button state:
     * 
     * addressIsValid, viewKeyIsValid, restoreHeightIsValid
     *   -If any of these are false: STATE 0
     *   -else, STATE 1
     *
     * scanHasStarted
     *   -If false, STATE 2
     *   -Else, STATE 3
     *
     * scanPercentage
     *   -if === 100, STATE 4
    
    /* --- Possible button states ---
     * 0. * The wallet has not yet created
     *    * The user has not filled out all fields with valid values OR
     *      the keys/wasm module has not yet loaded
     *      - The label reads "View incoming deposits" and is INACTIVE
     */    
    /* 1. * The wallet has not yet been created
     *    * The user HAS entered valid values, and all prereqs are loaded
     *     -  The label reads "View incoming deposits" and the button is ACTIVE
     */
    /* 2. * The user pressed the button and the wallet is being or has been created
     *    * The scan is "starting" but has not yet "started" (wtf does this mean?)
     *      - The label reads "Scanning" with loading wheel and the button is INACTIVE
     */
    /* 3. * The scan has "Started" and is actively running (?)
     *      - The label reads "Scanning (x%)" with loading wheel and the button is INACTIVE
     *      - ADDITIONALLY, a green progress bar overlays the button.
     */
    /* 4. * The wallet scan has finished
     *      - The label reads "View deposits to a different wallet"
     *      - The button is ACTIVE
     *      - Clicking the button resets the app
     */
    return(
      <>
        <button
          style = {{
            backgroundColor: "yellow",
            border: "0px",
            position: "absolute"
           }}
          onClick = {testSubmitButtonDisplay}
        >
          <p>All inputs are valid? {(addressIsValid.current && viewKeyIsValid.current && restoreHeightIsValid.current).toString()}</p>
          <p>Synchronization progres: {syncProgress}%</p>
          <p>Current test state step: {currentStep.current}</p>
          <p>Click this button to advance to the next test state</p>
       </button>
       <PageBox className = "deposit_viewer_page_box" boxWidth = {PAGE_BOX_WIDTH} bgColor = {PAGE_BOX_COLOR}>
     
         <div className = "large_spacer"></div>
 
         <TitleBar title = {TITLE}/>
     
         <div className = "large_spacer"></div>
     
         <div className = "description">
           <h2>{DESCRIPTION}</h2>
         </div>
         <div className = "large_spacer"></div>
         <DepositViewerTextEntryField
           validateEntry = {validateAddress}
           defaultValue = "Enter wallet's primary address"
         />
         <div className = "small_spacer"></div>
         <DepositViewerTextEntryField
           validateEntry = {validateViewKey}
           defaultValue = "Enter the wallet's view key"
         />
         <div className = "small_spacer"></div>
         <DepositViewerTextEntryField
           validateEntry = {validateRestoreHeight}
           defaultValue = "Enter restore height or date (yyyy-mm-dd)"
         />
         <div className = "small_spacer"></div>
           {buttonElement}
         <div className = "small_spacer"></div>
           <TransactionTable transactions = {transactionList} />
         <div className = "large_spacer"></div>
       </PageBox>
      </>    
    );
  } else {
    return(<h1>LOADING...</h1>);
  }
}
           
/**
 * Print sync progress every X blocks.
 */
class walletListener extends MoneroWalletListener {
              
  constructor(setBalance, setCurrentSyncProgress) { 
    super();
    this.setBalanace = setBalance;
    this.setCurrentSyncProgress = setCurrentSyncProgress;
    this.syncResolution = 0.05;
    this.lastIncrement = 0;
    this.walletIsSynchronized = false;
  }
              
  onSyncProgress(height, startHeight, endHeight, percentDone, message) {
    this.setCurrentSyncProgress(percentDone*100); 
    if (percentDone >= this.lastIncrement + this.syncResolution) {
      this.lastIncrement += this.syncResolution;
    }
  }
  
  onBalancesChanged(newBalance, newUnlockedBalance){
    if (this.walletIsSynchronized) {
      this.setBalance(newBalance); 
    }
  }
  
  setWalletIsSynchronized(value) {
    this.walletIsSynchronized = value;
  }
}

function ScanBlockchainButton(props){
  
  // The text of the "submit" button changes depending on context
  // AND it can contain additional content besides text (loading spinner) in some situations
  const [submitButtonContents, setSubmitButtonContents] = useState(
    <div className = "loading_button_contents_container">
      <span>This is a test</span>
      <LoadingAnimation/>
    </div>
  )
  
  let loadingAnimation;
  let message = props.buttonMessage;
  
  if(props.showLoadingWheel){
    loadingAnimation = <LoadingAnimation/>
  }
  
  return(
    <SubmitButton 
      progress = {props.syncProgress}
      message = {message}
      image = {loadingAnimation}
      alt_element = {progressBar}
      action = {props.handleSubmit}
    />
  )
}
