import React from 'react';
import "./buttons.css";
import { xmrToAtomicUnits } from 'monero-javascript/src/main/js/common/MoneroUtils';
import ProgressBar from "./ProgressBar.js";
/*
 * A generic function to create a multipurpose "swiss army knife" button, which may display:
 * 1. A button labeled with a provided message
 * 2. A button labeled with a provided message and an accompanying image (such as a loading indicator)
 * 3. A progress bar indicator containing the message and optional image.
 */
export function SubmitButton(props){

  //props.percentScanned fills in the progress bar
  let className = "";
  if(props.isActive){
    className = "submit_button";
  } else {
    className = "submit_button submit_button_inactive";
  }
  
  /*
    <SubmitButton 
      syncProgress = {props.syncProgress}
      message = {message}
      image = {loadingAnimation}
      alt_element = {progressBar}
    />
   */
   
  console.log("Button props.progress: " + props.progress);
   
  let renderElement;
  
  if (props.showProgressBar){
    renderElement = (
      <ProgressBar 
        progress = {props.progress}
        className = {className}
      >
        <span>{props.message}</span>
        {props.image}
      </ProgressBar>      
    )
  } else {
    renderElement = ( 
      <div
        className = {className}
        onClick = {props.action}
      >
        <span>{props.message}</span>
        {props.image}
      </div>
    )
  }
  
  return(
    <>
      {renderElement}
    </>
  );
}