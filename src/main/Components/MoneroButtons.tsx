import React from 'react';
import "./buttons.css";
import ProgressBar from "./ProgressBar";

/*
 * A generic function to create a multipurpose "swiss army knife" button, which may display:
 * 1. A button labeled with a provided message
 * 2. A button labeled with a provided message and an accompanying image (such as a loading indicator)
 * 3. A progress bar indicator containing the message and optional image.
 */
 
 /*
  * props:
  *  isActive: boolean
  *  showProgressBar: boolean
  *  progress: number
  *  action: (e: event) => void
  *  image: React.FC
  *  message: string
  */
  
type SubmitButtonsProps = {
  isActive: boolean,
  showProgressBar: boolean,
  progress: number,
  action?: () => void | undefined,
  image: JSX.Element,
  message: string
}
 
export function SubmitButton({isActive, showProgressBar, progress, action, image, message}: SubmitButtonsProps) {

  //percentScanned fills in the progress bar
  let className;
  if(isActive){
    className = "submit_button";
  } else {
    className = "submit_button submit_button_inactive";
  }
  
  console.log("Button progress: " + progress);
  console.log("Show progress bar?" + showProgressBar.toString());
  if (showProgressBar){
    return(
      <ProgressBar 
        progress = {progress}
        className = {className}
      >
        <span>{message}</span>
        {image}
      </ProgressBar>      
    )
  } else {
    return ( 
      <div
        className = {className}
        onClick = {action}
      >
        <span>{message}</span>
        {image}
      </div>
    )
  }
  
}