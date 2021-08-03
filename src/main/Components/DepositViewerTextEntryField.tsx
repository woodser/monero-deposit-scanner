import React, {useState, FunctionComponent}from 'react';
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
  handleTextChange?: (newText: string) => void
}
 
export default function({isActive, defaultValue, validateEntry}: DepositViewerTextEntryFieldProps){
  
  const [enteredText, setEnteredText] = useState("");
  const [enteredTextIsValid, setEnteredTextIsValid] = useState(true);
  
  // If the  don't specify whether the field is active, assume it should be.
  let isactive: boolean = (isActive === undefined ? true : isActive);
  
  const changeEnteredText = function(text: string){
    console.log("Running changeEnteredText");
    setEnteredText(text);
    if(validateEntry !== undefined && validateEntry !== null) {
      setEnteredTextIsValid(validateEntry(text));
    }
  }

  return(
       <PageTextEntry 
        defaultValue = {defaultValue}
        handleTextChange = {changeEnteredText}
        isactive={isactive}
        isValid={enteredTextIsValid}
        isSingleLineEntry = {true}
       />
  )
}