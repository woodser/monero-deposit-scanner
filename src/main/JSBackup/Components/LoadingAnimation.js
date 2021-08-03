import React from 'react';
import loadingAnimation from "../img/loadingAnimation.gif";
import VerticallyCenteredItemContainer from "./VerticallyCenteredItemContainer.js";
import './LoadingAnimation.css'

export default function(props) {
  
  // Remove the "onLoad" attribute if no notification function is provided - this will avoid errors
  let className = props.hide === true ? "hidden" : "";

  return ( 
    <VerticallyCenteredItemContainer>
      <img 
        className={"loading_animation " + className} 
        src={loadingAnimation} 
        alt="Spinner animation">
      </img>
    </VerticallyCenteredItemContainer>
  );

}