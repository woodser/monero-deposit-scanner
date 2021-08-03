import React from 'react';
import "./VerticallyCenteredItemContainer.css";

export default function (props){
  return(
    <div className = {props.className}>
      {props.children}
    </div>
  )
}