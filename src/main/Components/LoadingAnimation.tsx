import React, { FC } from 'react';
import loadingAnimation from "../img/loadingAnimation.gif";
import VerticallyCenteredItemContainer from "./VerticallyCenteredItemContainer";
import './LoadingAnimation.css'

type LoadingAnimationProps = {
  hide?: boolean
}

const componentFunction: FC<LoadingAnimationProps> = function({hide}: LoadingAnimationProps) {
  
  // Remove the "onLoad" attribute if no notification function is provided - this will avoid errors
  let className: string = hide === true ? "hidden" : "";

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

export default componentFunction;