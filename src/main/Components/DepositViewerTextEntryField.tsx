import React, {useState, useRef, FunctionComponent}from 'react';
import PageTextEntry from "./PageTextEntry";

const monerojs = require("monero-javascript");
const MoneroUtils = monerojs.MoneroUtils;

/*
 * :
 *  isActive: boolean (optional)
 *  defaultValue: string
 *  validateEntry
 */
 
type DepositViewerTextEntryFieldProps = {
  isActive?: boolean,
  defaultValue: string,
  validateEntry?: (entry: string) => boolean,
  handleTextChange?: (newText: string) => void,
  notifyParentOfChange?: () => void,
  debugOverride?: string
}
 
export default function({isActive, defaultValue, validateEntry, notifyParentOfChange, debugOverride}: DepositViewerTextEntryFieldProps){
  
  const [enteredText, setEnteredText] = useState<string>("");
  const [valid, setValid] = useState<boolean>(false);
  // If the  don't specify whether the field is active, assume it should be.
  let isactive: boolean = (isActive === undefined ? true : isActive);
  
  const changeEnteredText = function(text: string){
    setEnteredText(text);
    if(validateEntry !== undefined && validateEntry !== null) {
      setValid(validateEntry(text));
    }
    if(notifyParentOfChange !== undefined && notifyParentOfChange !== null) {
      // Remind the calling component to take any action that depends on validatEntry having completed
      notifyParentOfChange();
    }
  }
  
  console.log("Re-rendering text field");

  return(
       <PageTextEntry 
        defaultValue = {defaultValue}
        handleTextChange = {changeEnteredText}
        isactive={isactive}
        isValid={valid}
        isSingleLineEntry = {true}
        overrideValue = {debugOverride}
       />
  )
}