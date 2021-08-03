import React, {FC, useState, useRef, useEffect} from 'react';

import {SubmitButton} from "./Components/MoneroButtons";
import LoadingAnimation from "./Components/LoadingAnimation";
import "./app.css";
//import moneroLogo from "./img/logo.png";
import PageBox from "./Components/PageBox";
import DepositViewerTextEntryField from "./Components/DepositViewerTextEntryField";
//import VerticallyCenteredItemContainer from "./Components/VerticallyCenteredItemContainer"
//import MoneroLogo from "./img/MoneroLogo.png";
import TitleBar from "./Components/TitleBar";
//import ProgressBar from "./Components/ProgressBar";
import TransactionTable from "./Components/TransactionTable";
import {Transaction} from "./GlobalTypes";

const monerojs = require("monero-javascript");

/*
 * The second import of "monero-javascript" is necessary in order to create a 
 * type based off of it's child module
 */
import monerojsExplicitImport from "monero-javascript";

const LibraryUtils = monerojs.LibraryUtils;
const MoneroUtils = monerojs.MoneroUtils;
type MoneroWalletFull = monerojsExplicitImport.MoneroWalletFull;
//const MoneroRpcConnection = monerojs.MoneroRpcConnection;
const MoneroWalletListener = monerojs.MoneroWalletListener;
const MoneroNetworkType = monerojs.MoneroNetworkType;
const BigInteger = monerojs.BigInteger;

export default function App(){
  
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

  const [balance, setBalance] = useState<BigInteger>(BigInteger(0));
  const [deposits, setDeposits] = useState([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [viewkey, setViewKey] = useState<string | null>(null);
  const [restoreHeight, setRestoreHeight] = useState(0)
  const [dateConversionWalletIsLoaded, setDateConversionWalletIsLoaded] = useState(false);

  const [buttonState, setButtonState] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);

  const [transactionList, setTransactionList] = useState([] as Transaction[]);

  const addressIsValid = useRef(false);
  const viewKeyIsValid = useRef(false);
  const restoreHeightIsValid = useRef(false);
  const wallet = useRef<Promise<any> | any>();
  const dateConversionWallet = useRef<any | null>(null);
    
  // This function is purely for testing!
  const currentStep = useRef(0);
  
  /*
  {
        timeStamp: convertMillisecondsToFormattedDateString(randomTimeMilliseconds),
        amount: (Math.random() * 5000).toFixed(12),
        fee: (Math.random() * 10).toFixed(12),
        height: Math.trunc(Math.random() * 9999999).toString(),
        txHash: genRanHex(64).toString()
      }
  */
  const addTransaction: (transaction: Transaction) => void = function(transaction){
    setTransactionList(transactionList.concat([transaction] as Transaction[]));
    console.log("New transaction list: " + transactionList);
  }
  /* 
   * monero-javascript returns transaction datetimes in the form of an integer representing
   * the number of milliseconds that have passed since te epoch.
   * The spec requires dates to be displayed in the format:
   * YYYY-MM-DD HH:MM:SS UTC
   */
   const convertMillisecondsToFormattedDateString: (t: number) => string = function(t: number){
     let date = new Date(t);
     return(
       date.getUTCFullYear() + "-" + (date.getUTCMonth()+1) + "-" + date.getUTCDate() + " " + 
       date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds() + " UTC"
     )
   }
  
  // This function is strictly for generating a dummy list for debugging!
  const generateRandomTransaction = function(): Transaction {
    const genRanHex: (size: number) => string = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const maxTime = new Date().getTime();
    let randomTimeMilliseconds = Math.trunc(Math.random() * maxTime); 
    console.log("first random hex: " + genRanHex(64).toString());
    return(
      {
        timeStamp: convertMillisecondsToFormattedDateString(randomTimeMilliseconds),
        amount: (Math.random() * 5000).toFixed(12),
        fee: (Math.random() * 10).toFixed(12),
        height: Math.trunc(Math.random() * 9999999).toString(),
        txHash: genRanHex(64).toString()
      }
    )
  }
  
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
  
  
   const createDateConversionWallet = async function(){
    // Create a disposable,random wallet to prepare for the possibility that the user will attempt to restore from a date
    // At present, getRestoreHeightFromDate() is (erroneously) an instance method; thus, a wallet instance is
    // required to use it.
    let dateWallet;
    try {
      console.log("Attempting to create wallet");
      dateWallet = await monerojs.createWalletFull(WALLET_INFO);
    } catch(e){
      throw("Date wallet creation failed: " + e);
    }
    console.log("date wallet created");
    setDateConversionWalletIsLoaded(true);
    return dateWallet;
  }
  
  const resetApp = function(): void {
    /*
      const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [viewkey, setViewKey] = useState(null);
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
    
    setBalance(BigInteger(0));
    setWalletAddress(null);
    setViewKey(null);
    setRestoreHeight(0);
    //setDateConversionWalletIsLoaded(false);
    setButtonState(0);
    setSyncProgress(0);
    
    addressIsValid.current = false;
    viewKeyIsValid.current = false;
    restoreHeightIsValid.current = false;
    wallet.current = undefined;
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
  
  const setBalances = function(balance: BigInteger){
    setBalance(balance);
  }

  const setCurrentSyncProgress = function(percentDone: number){
    setSyncProgress(percentDone);
  }
  
  const startScanning = function() {
    console.log("You pressed da button!");
  }

  /**
   * Common helper to initialize the main page after the wallet is created and synced.
   *
   * Creates the tx generator, listens for event notifications, and starts background synchronization.
   */
  const _initMain: () => void = async function(){
    
    // resolve wallet promise
    // TODO (woodser): create new wallet button needs greyed while this loads
    let initWallet: MoneroWalletFull = await wallet.current;

    // If the user hit "Or go back" before the wallet finished building, abandon wallet creation
    // and do NOT proceed to wallet page
    
    // TEMPORARY - TO REMOVE ERRORS
    // Eventally implement ability for user to cancel wallet confirmation in this app
    let userCancelledWalletConfirmation = false;
    if (userCancelledWalletConfirmation) return;
    // register listener to handle balance notifications
    // TODO: register once wherever is appropriate, but need to update state with updated balances from wallet listener
    await initWallet.addListener(new class extends MoneroWalletListener {
      async onBalancesChanged(newBalance: BigInteger, newUnlockedBalance: BigInteger) {
        console.log("wallet.onBalancesChanged(" + newBalance.toString() + ", " + newUnlockedBalance.toString() + ")");
        setBalance(newBalance);
      }
    });
    
    // start syncing wallet in background if the user has not cancelled wallet creation.
    await wallet.current.startSyncing();
  }
  
  const validateAddress = function(address: string){
    return MoneroUtils.isValidAddress(address, MoneroNetworkType.MAINNET);
  }
  const validateViewKey = function(viewKey: string): boolean{
    try {
      MoneroUtils.validatePrivateViewKey(viewKey);
    } catch (e){
      return false;
    }
    return true;
  } 
  const validateRestoreHeight = function(restoreHeight: string): boolean {
    console.log("Validating restore height");
    return true;
  }
  
  /* Extracts the nuances of determining how to create the submit button under current circumstances from the main function
   * in order to maintain cleaner code
   */
  const createButtonElement = function(){
    let handleSubmit;
    let showLoadingWheel: boolean = false;
    let buttonMessage: string = "";
    
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
    
    // implicit typing. explicitly type "image"
    let image: JSX.Element = <></>;
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
              
  setBalance: (balance: BigInteger) => void;
  setCurrentSyncProgress: (progress: number) => void;
  syncResolution: number;
  lastIncrement: number;
  walletIsSynchronized: boolean;
              
  constructor(setBalance: (balance: BigInteger) => void, setCurrentSyncProgress: (progress: number) => void) { 
    super();
    this.setBalance = setBalance;
    this.setCurrentSyncProgress = setCurrentSyncProgress;
    this.syncResolution = 0.05;
    this.lastIncrement = 0;
    this.walletIsSynchronized = false;
  }
              
  onSyncProgress(height: number, startHeight: number, endHeight: number, percentDone: number, message: string) {
    this.setCurrentSyncProgress(percentDone*100); 
    if (percentDone >= this.lastIncrement + this.syncResolution) {
      this.lastIncrement += this.syncResolution;
    }
  }
  
  onBalancesChanged(newBalance: BigInteger, newUnlockedBalance: BigInteger){
    if (this.walletIsSynchronized) {
      this.setBalance(newBalance); 
    }
  }
  
  setWalletIsSynchronized(value: boolean) {
    this.walletIsSynchronized = value;
  }
}

