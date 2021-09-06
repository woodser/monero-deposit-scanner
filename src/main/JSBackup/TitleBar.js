import "./TitleBar.css";
import MoneroLogo from '../img/MoneroLogo.png';
import React from 'react';
import VerticallyCenteredItemContainer from "./VerticallyCenteredItemContainer.js";

export default function TitleBar(props){
  return(
         <div className = "title_bar">
         <div className = "title_bar_content_container">
           <img 
             src = {MoneroLogo}
             alt = "Monero logo"
             className = "monero_logo" 
           />
           <div className = "item_margin"></div>
           <h1>{props.title}</h1>

         </div>
         </div>
  )
}