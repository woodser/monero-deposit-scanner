import React, {useState}from 'react';
import PageTextEntry from "./PageTextEntry.js";

const monerojs = require("monero-javascript");
const MoneroUtils = monerojs.MoneroUtils;

export default function DepositViewerTextEntryField(props){
  
  //props.isValid
  
  const [enteredText, setEnteredText] = useState("");
  const [enteredTextIsValid, setEnteredTextIsValid] = useState(true);
  
  // If the props don't specify whether the field is active, assume it should be.
  let isactive = (props.isactive === undefined ? true : props.isactive);
  
  const changeEnteredText = function(text){
    setEnteredText(text);
    setEnteredTextIsValid(props.validateEntry(text));
  }
  /*
    <DepositViewerTextEntryField
      defaultValue = "Enter wallet's primary address"
      isactive={props.textEntryIsActive === undefined ? true : props.textEntryIsActive}
      validateEntry = {validateAddress}
      setEnteredText = {changeEnteredAddress}
      value = {enteredAddress}
    />
   */
  return(
       <PageTextEntry 
        defaultValue = {props.defaultValue}
        handleTextChange = {changeEnteredText}
        isactive={isactive}
        isValid={enteredTextIsValid}
        isSingleLineEntry = {true}
        value = {enteredText}
       />
  )
}