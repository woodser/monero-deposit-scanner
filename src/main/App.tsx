// ALSO: how to cancel date wallet loading if user simply enters a straight restore height?

/*
 * PUBLIC stagenet test wallet:
 *eldest older tuxedo enhanced arbitrary adhesive altitude yellow
 *thumbs major edited negative leech nozzle tossed diode
 *pebbles pedantic jargon thwart business nineteen jester jigsaw arbitrary
 *
 *addy: 58XaBA1vZWfL6ZiWXiAAuGGaBCrdz7pjK8xpQdPGMz1APj5vUnPjWJ34pvDj4p9zJqCr2ZXKvsySyEQFw9nBnAdLNrXuKDe
 *vk: ac8f4900cd7a3cc6fcdbb75f737da7dea41e243822e8c61e800fabd774b29d06
 */

import React, { useState, useRef, useEffect } from "react";

import isPositiveInteger from "./Tools/isPositiveInteger";

import { SubmitButton } from "./Components/MoneroButtons";
import "./app.css";
//import moneroLogo from "./img/logo.png";
import PageBox from "./Components/PageBox";
import DepositViewerTextEntryField from "./Components/DepositViewerTextEntryField";
//import VerticallyCenteredItemContainer from "./Components/VerticallyCenteredItemContainer"
//import MoneroLogo from "./img/MoneroLogo.png";
import TitleBar from "./Components/TitleBar";
//import ProgressBar from "./Components/ProgressBar";
import TransactionTable from "./Components/TransactionTable";
import { Transaction } from "./GlobalTypes";

// Load the images/animations that can be displayed on the button
import loadingAnimation from "./img/loadingAnimation.gif";
import checkmarkImage from "./img/checkmark.png"

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

//type  MoneroWalletListener = monerojsExplicitImport.MoneroWalletListener;
const MoneroWalletListener = monerojs.MoneroWalletListener;

type MoneroTxWallet = monerojsExplicitImport.MoneroTxWallet;
type MoneroOutputWallet = monerojsExplicitImport.MoneroOutputWallet;
const MoneroNetworkType = monerojs.MoneroNetworkType;
const BigInteger = monerojs.BigInteger;
const MoneroDaemonRpc = monerojsExplicitImport.MoneroDaemonRpc;
type MoneroDaemonRpc = monerojsExplicitImport.MoneroDaemonRpc;
const MoneroRpcConnection = monerojsExplicitImport.MoneroRpcConnection;
type MoneroRpcConnection = monerojsExplicitImport.MoneroRpcConnection;

// We should not be defining this constant outside of the main class!
// Unfortunately, defining as a ref and attempting to use that ref with
// .current results in a MoneroError stating that "current" is not a 
// valid field of MoneroRpcConnection
const NODE_ADDRESS = "http://127.0.0.1:80/";
const USERNAME = "username";
const PASSWORD = "password";
const WALLET_SYNC_PERIOD = 5000;
//const NODE_ADDRESS = "http://127.0.0.1:80/";
let rpcConnection: MoneroRpcConnection;

export default function App() {

  const TEST_WALLET_ADDRESS: string =
    "58XaBA1vZWfL6ZiWXiAAuGGaBCrdz7pjK8xpQdPGMz1APj5vUnPjWJ34pvDj4p9zJqCr2ZXKvsySyEQFw9nBnAdLNrXuKDe";
  const TEST_WALLET_KEY: string =
    "ac8f4900cd7a3cc6fcdbb75f737da7dea41e243822e8c61e800fabd774b29d06";

  const PAGE_BOX_WIDTH = "1024px";
  const PAGE_BOX_COLOR = "#f2be00";

  //The date on which the first Monero block was mined. Used to determine user-entered restore height date validity
  const MONERO_EPOCH_YEAR = 2014;
  const CURRENT_YEAR = new Date().getFullYear();

  const TITLE = "Monero deposit viewer";
  const DESCRIPTION = (
    <div className="description">
      <a href="http://github.com/woodser/monerotxviewer">Open-source</a>,
      client-side transaction scanner to view incoming deposits to a Monero
      wallet
    </div>
  );

  // State
  const [balance, setBalance] = useState<BigInteger>(BigInteger(0));
  const [deposits, setDeposits] = useState([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [viewkey, setViewKey] = useState<string>("");
  const [restoreHeight, setRestoreHeight] = useState<string>("0");
  const [dateConversionWallet, setDateConversionWallet] = useState<MoneroWalletFull | null>(null);
  const [walletCreationHasStarted, setWalletCreationHasStarted] = useState<boolean>(false);
  /*
   * Initialize to be ACTIVE - it will only deactivate if:
   *  1. The user entered an invalid or incomplete address or viewkey or improperly-formatted restore date)
   *  2. The user attempted to hit the submit button with an invalid restore height value
   *    (ie either larger than the current block height or a DATE before the "monero epoch" or after the current date)
   */
  const [buttonState, setButtonState] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);
  
  const [transactionList, setTransactionList] = useState([] as Transaction[]);
  const transactionListHolder = useRef([] as Transaction[]);
  const addressIsValid = useRef<boolean>(false);
  const viewKeyIsValid = useRef<boolean>(false);
  const restoreHeightIsValid = useRef<boolean>(true);

  // Persistant variables
  const fullModuleIsLoaded = useRef<boolean>(false);
  const enteredHeightIsDate = useRef<boolean>(false);
  const dateConversionWalletPromise = useRef<Promise<MoneroWalletFull> | null>(
    null
  );
  const txHashes = useRef([] as string[]);
  const wallet = useRef<MoneroWalletFull | null>(null);
  
  /*
    uri: string,
  username?: string,
  password?: string,
  rejectUnauthorized?: boolean
  */
  const daemonRpc = useRef<MoneroDaemonRpc | null>(null);
  const WALLET_INFO = {
    password: "Random password",
    networkType: "stagenet",
    server: rpcConnection
  };
  // Debug!
  const [useOverrideWallet, setUseOverrideWallet] = useState<boolean>(false);
  
  // "initialize" the functional component. useEffect runs before the first render
  useEffect(function () {
    try {
    rpcConnection = new MoneroRpcConnection({
      uri: NODE_ADDRESS,
      username: USERNAME,
      password: PASSWORD
    });
    } catch(e) {
      console.log("failed to create RPC connection: " + e);
    }
    async function loadPreRequisites() {
      // Load full wallet module
      try {
        await LibraryUtils.loadFullModule();
      } catch (e) {
        
        return;
      }
      fullModuleIsLoaded.current = true;
      
      // Create a daemon connection using the MoneroRpcConnection
      try {
        daemonRpc.current = await monerojs.connectToDaemonRpc({server: rpcConnection});
      } catch(e) {
        console.log("Daemon creation failed: " + e);
      }

      /*
       * Create a wallet to be used to convert dates to restore heights
       * This is necessary because MoneroWalletFull's conversion function is
       * an instance member function rather than a static class function
       */
      try {
        createDateConversionWallet();
      } catch (e) {
        
        return;
      }
    }

    loadPreRequisites();
  }, []);

  useEffect(function(): void {
    
    
  }, [transactionList])

  const addTransaction: (transaction: MoneroTxWallet) => void = async function (transaction) {
    /*
     * Make sure this transaction has not already been added to the list
     * (because onOutputReceived can be called multiple times for a single Tx- once when "acknowleged",
     * again when confirmed, etc)
     */
    let currentTxHash: string = transaction.getHash();
    
    if (!txHashes.current.includes(currentTxHash)) {
      txHashes.current.push(currentTxHash);
      // The typescript compiler mistakenly assumes that wallet could be "null".
      let fullTx: MoneroTxWallet;
      if (wallet.current !== null) {
        
        // onOutputReceived() only provides skeleton of transaction, so fetch full transaction
        if (await wallet.current.isSynced()) fullTx = await wallet.current.getTx(currentTxHash); // checks the pool for updates
        else fullTx = (await wallet.current.getTxs({hash: currentTxHash, isConfirmed: true}))[0]; // avoid network request to pool during sync
        
        // Convert the MoneroTxWallet to a viewable string representation
        // MoneroWalletListener fires onOutputReceived twice for every tx; first when unconfirmed and again when confirmed
        // In order to prevent duplicates,

        // The timestamp needs to be obtained from the daemon
        let timestamp: number;
        if(daemonRpc.current === null) {
          
          return;
        } else {
          
          
          
          const txHeight = fullTx.getHeight();
          const blockHeader = await daemonRpc.current.getBlockHeaderByHeight(txHeight);
          timestamp = blockHeader.getTimestamp();
          
        }
        
        let displayFormattedTransaction: Transaction = {
          timeStamp: convertMillisecondsToFormattedDateString(timestamp),
          amount: fullTx.getIncomingAmount().toString(),
          fee: fullTx.getFee().toString(),
          height: fullTx.getHeight().toString(),
          txHash: fullTx.getHash().toString()
        };
        
        let txListCopy = transactionListHolder.current.slice();
        
        txListCopy.push(displayFormattedTransaction);
               
        transactionListHolder.current = txListCopy;
        setTransactionList(txListCopy);
        
      } else {
        throw new Error("Wallet is null");
      }
    } else {
      // hash is already in the list
    }
  };
  /*
   * monero-javascript returns transaction datetimes in the form of an integer representing
   * the number of milliseconds that have passed since the epoch.
   * The spec requires dates to be displayed in the format:
   * YYYY-MM-DD HH:MM:SS UTC
   */
  const convertMillisecondsToFormattedDateString: (
    t: number
  ) => string = function (t: number) {
    
    
    let date = new Date(1622334);
    
    return (
      date.getUTCFullYear() +
      "-" +
      (date.getUTCMonth() + 1) +
      "-" +
      date.getUTCDate() +
      " " +
      date.getUTCHours() +
      ":" +
      date.getUTCMinutes() +
      ":" +
      date.getUTCSeconds() +
      " UTC"
    );
  };

  /*
  // This function is strictly for generating a dummy list for debugging!
  const generateRandomTransaction = function(): Transaction {
    const genRanHex: (size: number) => string = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const maxTime = new Date().getTime();
    let randomTimeMilliseconds = Math.trunc(Math.random() * maxTime); 
    // 
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
  */

  const checkIfAllInputsAreValid: () => void = function () {
    console.log("Checking input validity")
    if (
      addressIsValid.current &&
      viewKeyIsValid.current &&
      restoreHeightIsValid.current
    ) {
      setButtonState(1);
    } else {
      setButtonState(0);
    }
  };

  const createDateConversionWallet: () => void = async function () {
    // Create a disposable,random wallet to prepare for the possibility that the user will attempt to restore from a date
    // At present, getRestoreHeightFromDate() is (erroneously) an instance method; thus, a wallet instance is
    // required to use it.
    try {
      // 
      dateConversionWalletPromise.current = monerojs
        .createWalletFull(WALLET_INFO)
        .then(function (resolvedDateWallet: MoneroWalletFull) {
          console.log("Date wallet created");
          setDateConversionWallet(resolvedDateWallet);
          // Set the "action" button (ie the only button in the app) text, color, and pressability accordingly
          //checkIfAllInputsAreValid();
        });
      // TODO - migrate to promise.then.catch
    } catch (e) {
      throw "Date wallet creation failed: " + e;
    }
  };

  const resetApp = function (): void {
    setBalance(BigInteger(0));
    setWalletAddress("");
    setViewKey("");
    setRestoreHeight("0");
    //setDateConversionWalletIsLoaded(false);
    setButtonState(0);
    setSyncProgress(0);

    addressIsValid.current = false;
    viewKeyIsValid.current = false;
    restoreHeightIsValid.current = false;
    wallet.current = null;
    //dateConversionWallet.current = null;
  };



  const setBalances = function (balance: BigInteger) {
    setBalance(balance);
  };

  const setCurrentSyncProgress = function (percentDone: number) {
    // We only want to update every 1/100 of a percent
    // In other words when a decimal in the 1/10 or 1/100 place increaes
    const hundredthPercent = Math.trunc(percentDone * 100) / 100; //Trim everything after the second decimal
    if (percentDone === 100) {
      setButtonState(5);
      console.log("");
      console.log("!!!");
      console.log("Sync finished! setting buttonState to 5");
      console.log("!!!");
      console.log("");
    } else if(hundredthPercent > syncProgress) {
      setSyncProgress(hundredthPercent);
    }
  };

  const startScanning = async function () {
    // 
    // Update the button's state
    setButtonState(2);
    /*
     * The final height - be it a simple number cast of a straightforward height number or a conversion
     * from a date will be stored in height
     */
    let height: number = 0;

    /*
     * use the date conversion wallet to verify the restore height
     * If the date wallet is not yet loaded, display "Working" with a loading wheel on the button
     */
    // Did the user enter the eight in the form of a date?
    if (enteredHeightIsDate.current) {
      console.log("Date height entered");
      // Is the conversion wallet loaded yet?
      if (dateConversionWallet === null) {
        // If not, wait for it to finish before proceeding
        await dateConversionWalletPromise.current;
        console.log("date conversion wallet promise returned");
      }
      // Parse the date out into month, day, and year numbers
      let numberRegex: RegExp = /[0-9]+/g;
      let matches: RegExpMatchArray[] = [
        ...restoreHeight.matchAll(numberRegex)
      ];
      console.log("The regExpMatchArray: " + JSON.stringify(matches));
      let parsedDate = {
        month: parseInt(matches[0][0]),
        day: parseInt(matches[1][0]),
        year: parseInt(matches[2][0])
      };
      try {
        /*
         * dateConversionWallet cannot possibly be null at this point, but the typescript compiler doesn't realize that.
         * This "if" statement is only here to satisfy the compiler and prevent an error
         */
        if (dateConversionWallet !== null) {
          height = await dateConversionWallet.getHeightByDate(
            parsedDate.year,
            parsedDate.month,
            parsedDate.day
          );
          console.log("The date parsed as height: " + height);
        }
      } catch(e) {
        restoreHeightIsValid.current = false;
        setButtonState(0);
        console.log("Can't parse an invalid date: " + e);
        return;
      }
      // 
      setButtonState(3);
    } else {
      if (restoreHeight === "") {
        // Use a default height of "0" if the user has not entered a height or date
        height = 0;
      } else {
        height = parseInt(restoreHeight);
      }
    }

    //Attempt to create the wallet
    monerojs
      .createWalletFull(
        Object.assign(
          {
            privateViewKey: viewkey,
            primaryAddress: walletAddress,
            restoreHeight: height
          },
          WALLET_INFO
        )
      )
      .then(function (resolvedWallet: MoneroWalletFull): void {
        resolvedWallet.addListener(
          new walletListener(
            setCurrentSyncProgress,
            setBalance,
            addTransaction,
            checkIfAllInputsAreValid
          )
        );
        wallet.current = resolvedWallet;
        wallet.current.getAddress(0, 0).then((address: string) => {
          
        });
        wallet.current.getPrivateViewKey().then((viewKey: string) => {
          
        });
        
        // initial sync allows concurrent wallet calls in order to collect txs during scanning
        resolvedWallet.sync(undefined, undefined, true).then(function() {
          resolvedWallet.startSyncing(WALLET_SYNC_PERIOD);
        });

        // Set the "action" button (ie the only button in the app) text, color, and pressability accordingly
        setButtonState(4);
        // Does createWalletFull in fact return an "Error" object on failure?
      })
      .catch(function (e: Error) {
        console.log("Failed to create main wallet: " + e);
        setButtonState(1);
      });
  };

  const validateAddress = function (address: string): boolean {
    //Remove leading and trailing whitespace
    address = address.trim();
    setWalletAddress(address);
    /*
     * Empty input is always "valid" when determining whether to render the red boder the input field
     * But is NOT valid fo the purposes of the "action" button
     */
    if (address === "") {
      addressIsValid.current = false;
      setButtonState(0);
      // "" is not a valid entry to SUBMIT, but the text entry should not turn red until the user enters characters
      return true;
    }
    if (MoneroUtils.isValidAddress(address, MoneroNetworkType.STAGENET)) {
      
      addressIsValid.current = true;
      checkIfAllInputsAreValid();
      return true;
    } else {
      
      addressIsValid.current = false;
      setButtonState(0);
      return false;
    }
  };

  const validateViewKey = function (viewKey: string): boolean {
    // Remove leading and trailing whitespace
    viewKey = viewKey.trim();
    setViewKey(viewKey);
    /*
     * Empty input is always "valid" when determining whether to render the red boder the input field
     * But is NOT valid fo the purposes of the "action" button
     */
    if (viewKey === "") {
      
      viewKeyIsValid.current = false;
      setButtonState(0);
      return true;
    }
    try {
      MoneroUtils.validatePrivateViewKey(viewKey);
    } catch (e) {
      // The user entered an invalid view key
      
      viewKeyIsValid.current = false;
      setButtonState(0);
      return false;
    }
    // The user entered a valid view key
    
    viewKeyIsValid.current = true;
    checkIfAllInputsAreValid();
    return true;
  };

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
  const validateRestoreHeightPattern = function (restoreHeight: string): boolean {
    // Remove leading and trailing whitespace
    restoreHeight = restoreHeight.trim();
    // Update local (to App) copy of the restore height string
    setRestoreHeight(restoreHeight);
    // Empty input is always "valid" when determining whether to render the red boder the input field
    // But is NOT valid fo the purposes of the "action" button
    if (restoreHeight === "") {
      
      restoreHeightIsValid.current = true;
      checkIfAllInputsAreValid();
      return true;
    }

    // Check to see if the entered height contains non-digit characters
    const nonDigitRegex = new RegExp("[^0-9]", "g");
    const validNonDigitRegex = new RegExp("(/|-)");

    let matches: RegExpMatchArray[] = [
      ...restoreHeight.matchAll(nonDigitRegex)
    ];

    /*
     * A valid (but incomplete) date should NOT draw red border, but SHOULD make button inactive
     * Thus, if false, setButtonState(0) but also return true.
     */
    let dateIsComplete = false;

    // If there ARE any matches...
    if (matches.length > 0) {
      enteredHeightIsDate.current = true;

      /*
       * A valid date, even incompletely typed, will DEFINITELY meet two requirements:
       * 1. It will be no longer than 10 characters
       * 2. It will have no more than two non-digit characters
       */
      if (restoreHeight.length > 10 || matches.length > 2) {
        // 
        restoreHeightIsValid.current = false;
        setButtonState(0);
        return false;
      }

      /*
       * The first non-digit character should either be a "/" or a "-" and should only
       * occur at element 1 (if single-digit month) or two (if double-digit month)
       */

      let monthBumper = 1;
      if (validNonDigitRegex.test(matches[0][0])) {
        // If the first delimitter is in element 1
        if (matches[0].index === 1) {
          // The month is only one digit
          monthBumper = 0;
        } else if (matches[0].index === 2) {
          // Verify that the month string as a number is <= 12
          let monthAsNum = parseInt(restoreHeight.slice(0, 2), 10);
          if (monthAsNum === 0 || monthAsNum > 12) {
            restoreHeightIsValid.current = false;
            setButtonState(0);
            return false;
          }
        } else {
          //The first delimitter is in an invalid position.
          // 
          restoreHeightIsValid.current = false;
          setButtonState(0);
          return false;
        }
      } else {
        //The first delimiter is not a valid delimiter char
        // 
        restoreHeightIsValid.current = false;
        setButtonState(0);
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
      let isSecondDelimitter: boolean = false;
      
      if(matches.length === 2) {
        isSecondDelimitter = true;
        if(matches[1].index === (matches[0].index + 1)) {
          
          restoreHeightIsValid.current = false;
          setButtonState(0);
          return false;
        }
      }
      // 
      // If the user has typed at least one day digit
      if (restoreHeight.length > (matches[0].index || -1) + 1) {
        // If there are at least two caracters after the first delimiter
        if (restoreHeight.length > (matches[0].index || -1) + 2) {
          // 
          //dayBumper = 1;
          // Is there a second delimiter?
          if (isSecondDelimitter) {
            // We expect the user to be consistent in using either "/" or "-" as a delimiter
            
            
            
            if (!(matches[1][0] === matches[0][0])) {
              
              restoreHeightIsValid.current = false;
              setButtonState(0);
              return false;

              //If the delimitter is in an invalid position (ie adjacent to the first or more than two characters AFTER the first)
              /*
               * "(matches[1].index || -1)" SHOULD NOT BE NECESSARY; however, omitting it causes an error that matches[1].index could be undefined.
               * which is patently untrue due to the parent conditional "if (matches.length === 2)"
               */
            } else if ((matches[1].index || 0) > matches[0].index + 3) {
              
              restoreHeightIsValid.current = false;
              setButtonState(0);
              return false;
            } else {
              // 
              // If the entered day is two digits:
              if (matches[1].index === (matches[0].index || -1) + 3) {
                // 
                dayBumper = 1;
              }
            }
            // Is the user starting to type a day longer than 2 digits?
          } else if (restoreHeight.length > 4 + monthBumper) {
            //The user attempted to type a day with more than two digits
            // 
            restoreHeightIsValid.current = false;
            setButtonState(0);
            return false;
          //There are exactly two day digits. Verify that they are valid.
          }
          
          
          dayAsNum = parseInt(
            restoreHeight.slice(2 + monthBumper, 4 + monthBumper),
            10
          );
          // Is the day a valid number between 1 and 32?
          if (dayAsNum === 0 || dayAsNum > 31) {
            // invalid day value
            // 
            restoreHeightIsValid.current = false;
            setButtonState(0);
            return false;
          }
         
        }
      }

      // 
      // 
      // 

      //Finally, make sure the year (or portion of it entered) is no more than four digits
      // if the user has entered or started to enter a year:
      if (restoreHeight.length > 4 + dayBumper + monthBumper) {
        if (restoreHeight.length > 8 + monthBumper + dayBumper) {
          //The year has more than four digits and is therefore invalid
          // 
          restoreHeightIsValid.current = false;
          setButtonState(0);
          return false;
          // If the year is between 1 and 4 digits
        } else if (restoreHeight.length === 8 + monthBumper + dayBumper) {
          // 
          let yearAsNum = Number(
            restoreHeight.slice(4 + monthBumper + dayBumper)
          );
          // 
          if (yearAsNum < MONERO_EPOCH_YEAR || yearAsNum > CURRENT_YEAR) {
            // 
            restoreHeightIsValid.current = false;
            setButtonState(0);
            return false;
          }
          dateIsComplete = true;
        }
      }
    } else {
      // Restore height is just digits
      // 
      enteredHeightIsDate.current = false;

      //Validate plain restore height
      //First make sure it is a valid number type
      //Next make sure it is positive integer
      //Finally make sure it is <= current daemon height.

      if (isPositiveInteger(restoreHeight)) {
        
        restoreHeightIsValid.current = true;
        checkIfAllInputsAreValid();
        return true;
      } else {
        
        restoreHeightIsValid.current = false;
        setButtonState(0);
        return false;
      }
    }

    if (dateIsComplete) {
      restoreHeightIsValid.current = true;
    } else {
      restoreHeightIsValid.current = false;
    }
    checkIfAllInputsAreValid();
    return true;
  };

  /* Extracts the nuances of determining how to create the submit button under current circumstances from the main function
   * in order to maintain cleaner code
   *
   * Creating a variable for the button element makes it possible to construct the button programmatically/conditionally
   */
  const createButtonElement = function () {
    let handleSubmit;
    let image: string = "";
    let buttonMessage: string = "";

    /*
     * isActive is false if the user-entered data (address, height, etc.) has not yet satisfied requirements.
     * It causes the button to be "grayed out"
     */
    let isActive = false;
    // 
    if (buttonState === 5) {
      handleSubmit = resetApp;
      image = checkmarkImage
      buttonMessage = "Synchronized!";
      console.log("Setting button according to state 5");
      isActive = true;
    } else if (buttonState === 4) {
      image = loadingAnimation
      buttonMessage = "Scanning (" + Math.trunc(syncProgress) + ")";
    } else if (buttonState === 3) {
      buttonMessage = "Starting scan";
    } else if (buttonState === 2) {
      buttonMessage = "working...";
      image = loadingAnimation
    } else if (buttonState === 1) {
      buttonMessage = "View incoming deposits";
      handleSubmit = startScanning;
      console.log("Setting button according to state '1'");
      isActive = true;
    } else {
      // buttonState === 0
      buttonMessage = "View incoming deposits";
    }

    let showProgressBar = false;
    if (syncProgress > 0 && syncProgress < 100) {
      showProgressBar = true;
    }

    return (
      <SubmitButton
        progress={syncProgress}
        message={buttonMessage}
        image={image}
        showProgressBar={showProgressBar}
        action={handleSubmit}
        isActive={isActive}
      />
    );
  };

  const useTestWallet: () => void = function () {
    
    if (useOverrideWallet) {
      setUseOverrideWallet(false);
      validateAddress("");
      validateViewKey("");
    } else {
      setUseOverrideWallet(true);
      validateAddress(TEST_WALLET_ADDRESS);
      validateViewKey(TEST_WALLET_KEY);
    }
  };

  let buttonElement = createButtonElement();
  /* Vars that affect button state:
     * 
     * addressIsValid.current, viewKeyIsValid.current, restoreHeightIsValid.current
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
  // 
  // 
  // 

  return (
    <>
      <button
        style={{
          backgroundColor: "yellow",
          border: "1px solid black",
          position: "absolute"
        }}
        onClick={useTestWallet}
      >
        Use test wallet
      </button>
      <PageBox
        className="deposit_viewer_page_box"
        boxWidth={PAGE_BOX_WIDTH}
        bgColor={PAGE_BOX_COLOR}
      >
        <div className="large_spacer"></div>

        <TitleBar title={TITLE} />

        <div className="large_spacer"></div>

        <div className="description">
          <h2>{DESCRIPTION}</h2>
        </div>
        <div className="large_spacer"></div>
        <DepositViewerTextEntryField
          validateEntry={validateAddress}
          notifyParentOfChange={checkIfAllInputsAreValid}
          defaultValue="Enter wallet's primary address"
          debugOverride={useOverrideWallet ? TEST_WALLET_ADDRESS : undefined}
        />
        <div className="small_spacer"></div>
        <DepositViewerTextEntryField
          validateEntry={validateViewKey}
          notifyParentOfChange={checkIfAllInputsAreValid}
          defaultValue="Enter the wallet's view key"
          debugOverride={useOverrideWallet ? TEST_WALLET_KEY : undefined}
        />
        <div className="small_spacer"></div>
        <DepositViewerTextEntryField
          validateEntry={validateRestoreHeightPattern}
          notifyParentOfChange={checkIfAllInputsAreValid}
          defaultValue="Enter restore height or date (yyyy-mm-dd)"
        />
        <div className="small_spacer"></div>
        {buttonElement}
        <div className="small_spacer"></div>
        <TransactionTable transactions={transactionList} />
        <div className="large_spacer"></div>
      </PageBox>
    </>
  );
}

/**
 * Print sync progress every X blocks.
 */
class walletListener extends MoneroWalletListener {
  setBalance: (balance: BigInteger) => void;
  setCurrentSyncProgress: (progress: number) => void;
  addTransaction: (transaction: MoneroTxWallet) => void;
  syncResolution: number;
  lastIncrement: number;
  walletIsSynchronized: boolean;

  constructor(
    setCurrentSyncProgress: (progress: number) => void,
    setBalance: (balance: BigInteger) => void,
    addTransaction: (transaction: MoneroTxWallet) => void,
    checkIfAllInputsAreValid: () => void
  ) {
    super();
    this.checkIfAllInputsAreValid = checkIfAllInputsAreValid;
    this.setBalance = setBalance;
    this.addTransaction = addTransaction;
    this.setCurrentSyncProgress = setCurrentSyncProgress;
    this.syncResolution = 0.05;
    this.lastIncrement = 0;
    this.walletIsSynchronized = false;
  }

  onSyncProgress(
    height: number,
    startHeight: number,
    endHeight: number,
    percentDone: number,
    message: string
  ) {
    this.setCurrentSyncProgress(percentDone * 100);
    if (percentDone >= this.lastIncrement + this.syncResolution) {
      this.lastIncrement += this.syncResolution;
    }
    // Reaching 100% wallet synchronization will change the submit button state
    //if (percentDone === 1) {
    //  this.checkIfAllInputsAreValid();
    //}
  }

  onBalancesChanged(newBalance: BigInteger, newUnlockedBalance: BigInteger) {
    if (this.walletIsSynchronized) {
      this.setBalance(newBalance);
    }
  }

  //When a new TX appears during syncing
  async onOutputReceived(output: MoneroOutputWallet) {
    this.addTransaction(output.getTx());
  }

  setWalletIsSynchronized(value: boolean) {
    this.walletIsSynchronized = value;
  }
}
