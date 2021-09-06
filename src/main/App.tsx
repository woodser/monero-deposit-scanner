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
  
  //The date on which the first Monero block was mined. Used to determine user-entered restore height date validity
  const MONERO_EPOCH_YEAR = 2014;
  const CURRENT_YEAR = new Date().getFullYear();
  
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

  const addressIsValid = useRef<boolean>(false);
  const viewKeyIsValid = useRef<boolean>(false);
  const restoreHeightIsValid = useRef(false);
  const wallet = useRef<Promise<MoneroWalletFull> | MoneroWalletFull>();
  const dateConversionWallet = useRef<MoneroWalletFull | null>(null);
    
  // This function is purely for testing!
  const currentStep = useRef<number>(0);
  
  const fullModuleIsLoaded = useRef<boolean>(false);
  
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
  
  useEffect(function() {
    
    async function loadPreRequisites(){
      
      try {
        LibraryUtils.loadFullModule().then(() => {
          console.log("Full module loaded");
          fullModuleIsLoaded.current = true;
        });
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
    return MoneroUtils.isValidAddress(address, MoneroNetworkType.STAGENET);
  }
  const validateViewKey = function(viewKey: string): boolean{
    try {
      MoneroUtils.validatePrivateViewKey(viewKey);
    } catch (e){
      return false;
    }
    return true;
  } 
  
  /* This function will only check for valid characters!
   *
   * per woodser:
   * I'd stick with complete validation of address and viewkey on every keystroke, 
   * disabling the button and showing red if invalid
   * and then for the date, doing pattern matching validation on every keystroke and 
   * complete validation on focus out, showing red and disabling the button if invalid 
   */
   
   /*
    * this is the first of two functions for validating restore height.
    * this is the "lite" version; it only checks that the entered eight matches a pattern:
    * "#...#" or "##/##/####"
    * and will turn the text box red if it does not
    * This is done in order not to indicate invalid input when the user has started to enter
    * BUT NOT FINISHED ENTERING a valid restore height.
    */
    
    // TODO: 
  const validateRestoreHeightPattern = function(restoreHeight: string): boolean {
    console.log("Validating restore height");
    
    // Check to see if the entered height contains non-digit characters
    const nonDigitRegex = new RegExp('[^0-9]', 'g');
    const validNonDigitRegex = new RegExp('(/\|-)');
    
    let matches: RegExpMatchArray[] = [...restoreHeight.matchAll(nonDigitRegex)];

    // If there ARE any matches...
    if (matches.length > 0) {
      /*
       * A valid date, even incompletely typed, will DEFINITELY meet two requirements:
       * 1. It will be no longer than 10 characters
       * 2. It will have no more than two non-digit characters
       */
      if(restoreHeight.length > 10 || matches.length > 2) {
        return false;
      }
      
      /*
       * The first non-digit character should either be a "/" or a "-" and should only
       * occur at element 1 (if single-digit month) or two (if double-digit month)
       */ 
      let monthBumper = 1;
      if(validNonDigitRegex.test(matches[0][0])) {
        // If the first delimitter is in element 1
        if(matches[0].index === 1) {
          // The month is only one digit
          monthBumper = 0;
        } else if (matches[0].index === 2) {
          // Verify that the month string as a number is <= 12
          let monthAsNum = parseInt(restoreHeight.slice(0,2), 10);
          if(monthAsNum === 0 || monthAsNum > 12) {
            console.log("Month must be between 1 and 12")
            return false;
          }
        } else {
          //The first delimitter is in an invalid position.
          console.log("The first delimiter is in an invalid position");
          return false;
        }
      } else {
        //The first delimiter is not a valid delimiter char
        console.log("The first delimitter is not a valid delimitter character.");
        return false;
      }
      
      /*
       * The first non-digit character must be valid. Next...
       * * See if the user has typed or started to type a day
       * * Check the second non-digit character for validity:
       */
      /*
       * when checking the position of the second non-digit character for validity, the app
       * must take into account whether the month was a single or double-digit value as that will affect
       * which positions are valid for the second non-digit character
       */
      
      // has the user started to enter a day?
      let dayAsNum: number;
      let dayBumper: number = 0;
      
      
      
      
      
      
      //TODO: characters including an coming oafter the second delimitter should not be considered when determing day is only 1 or two digits
      
      
      
      
      
      
      console.log("restoreHeightLength: " + restoreHeight.length + "; matches[0].index: " + (matches[0].index || -1).toString());
      // If the user has typed at least one day digit
      if(restoreHeight.length > (matches[0].index || -1) + 2) {
        console.log("The user has typed at least one day digit")
        // If there are at least two caracters after the first delimiter
        if(restoreHeight.length > (matches[0].index || -1) + 3) {
          console.log("The user has typed two or more day digits; dayBumper should not be set to zero!");
          //dayBumper = 1;
          // Is there a second delimiter? 
          if(matches.length === 2) {
            // We expect the user to be consistent in using either "/" or "-" as a delimiter
            if(!(matches[1][0] === matches[0][0])) {
              console.log("The second delimiter is either an invalid delimiter or is not consistent with the first delimiter");
              return false;
              
            //If the delimitter is in an invalid position (ie adjacent to the first or more than two characters AFTER the first)
            /*
             * "(matches[1].index || -1)" SHOULD NOT BE NECESSARY; however, omitting it causes an error that matches[1].index could be undefined.
             * which is patently untrue due to the parent conditional "if (matches.length === 2)"
             */
            } else if(matches[1].index === (matches[0].index || -1) + 1 || (matches[1].index || -1) > (matches[0].index || -1) + 3) {
              console.log("There must be exactly 1 or 2 digits between the delimitters");  
              return false;
            } else {
              console.log("There is a second, valid delimitter.");
              // If the entered day is two digits:
              if(matches[1].index === matches[0].index + 3) {
                console.log("Setting dayBumper to 1");
                dayBumper = 1;
              }
            }
          // Is the user starting to type a day longer than 2 digits?
          } else if(restoreHeight.length > 4 + monthBumper) {
            //The user attempted to type a day with more than two digits
            console.log("Day cannot be longer than two digits");
            return false;
          //There are exactly two day digits. Verify that they are valid. 
          } else {
            
            
            
            
            
            
            
            // START HERE
            
            
            
            
            
           dayAsNum = parseInt(restoreHeight.slice(2 + monthBumper, 4 + monthBumper), 10);
            // Is the day a valid number between 1 and 32?
            if(dayAsNum === 0 || dayAsNum > 31){
              // invalid day value
              console.log("Day must be a value between 1 and 31");
              return false;
            }           
          }        
        }
      }
      
      console.log(" ");
      console.log("monthBumper: " + monthBumper + ", dayBumper: " + dayBumper);
      console.log(" ");
      
      //Finally, make sure the year (or portion of it entered) is no more than four digits
      // if the user has entered or started to enter a year:
      if(restoreHeight.length > 4 + dayBumper + monthBumper) {
        if(restoreHeight.length > (8 + monthBumper + dayBumper)){
          //The year has more than four digits and is therefore invalid
          console.log("Invalid year");
          return false;
        // If the year is between 1 and 4 digits
        } else if (restoreHeight.length === 8 + monthBumper + dayBumper){ 
          console.log("Year: " + restoreHeight.slice(4 + monthBumper + dayBumper));
          let yearAsNum = Number(restoreHeight.slice(4 + monthBumper + dayBumper));
          console.log("yearAsNum: " + yearAsNum.toString());
          if(yearAsNum < MONERO_EPOCH_YEAR || yearAsNum > CURRENT_YEAR) {
            console.log("Year must be >= 2014 and <= " + CURRENT_YEAR.toString());
            return false;
          }
        }
      }
    }
    console.log("Valid date entered (so far)");
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
           validateEntry = {validateRestoreHeightPattern}
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

