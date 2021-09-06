import "./TitleBar.css";
import moneroLogo from '../img/MoneroLogo.png';
import React from 'react';
import VerticallyCenteredItemContainer from "./VerticallyCenteredItemContainer.js";

type TitleBarProps = {
  title: string
}

export default function TitleBar({title}: TitleBarProps){
  return(
         <div className = "title_bar">
         <div className = "title_bar_content_container">
           <img 
             src = {moneroLogo}
             alt = "Monero logo"
             className = "monero_logo" 
           />
           <div className = "item_margin"></div>
           <h1>{title}</h1>

         </div>
         </div>
  )
}