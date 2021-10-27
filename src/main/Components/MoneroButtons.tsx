import React from 'react';
import "./buttons.css";
import ProgressBar from "./ProgressBar";

import VerticallyCenteredItemContainer from "./VerticallyCenteredItemContainer";

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
  image: string,
  message: string
}

type SubmitButtonImageProps = {
  hide?: boolean,
  image: string
}
 
export function SubmitButton({isActive, showProgressBar, progress, action, image, message}: SubmitButtonsProps) {

  //percentScanned fills in the progress bar
  let className: string;
  if(isActive){
    className = "submit_button";
  } else {
    className = "submit_button submit_button_inactive";
  }
  
  // The button may or may not show an image; thus a dynamic "placeholder" is need in jSX
  let imageSpace: JSX.Element;
  
  if(image === "") {
    imageSpace = <></>;
  } else {
    imageSpace = <SubmitButtonImage image = {image} />;
  }
  
  if (showProgressBar){
    return(
      <ProgressBar 
        progress = {progress}
        className = {className}
      >
        <span>{message}</span>
        <SubmitButtonImage image = {image} />
         
      </ProgressBar>      
    )
  } else {
    return ( 
      <div
        className = {className}
        onClick = {action}
      >
        <span>{message}</span>
        {imageSpace}
      </div>
    )
  } 
}

// Can we remove the hide property? is it necessary in this app?
export function SubmitButtonImage({hide, image} : SubmitButtonImageProps) {
  // Remove the "onLoad" attribute if no notification function is provided - this will avoid errors
  let className: string = hide === true ? "hidden" : "";

  return ( 
    <VerticallyCenteredItemContainer>
      <img 
        className = {"submit_button_image " + className} 
        src = {image} 
        alt = "Button image">
      </img>
    </VerticallyCenteredItemContainer>
  )
}