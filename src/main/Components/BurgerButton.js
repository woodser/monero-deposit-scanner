/*
 * BurgerButton: a generic burger menu button appearing in the top-right corner of the screen; 
 * Clicking it opens the network selector
 */
 
import React from 'react';
import burgerImage from './img/BurgerButton.png';
 
export default function (props) {  
  const handleClick = function(event){
    props.toggleBurgerMenu();
  }

  return(
    <div className = "burger_button" onClick = {handleClick}>
      <img src = {burgerImage} alt = "Burger Menu Button"></img>
    </div>
  )
}