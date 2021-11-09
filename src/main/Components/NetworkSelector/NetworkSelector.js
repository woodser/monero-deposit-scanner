import React, {useState}from 'react';
import "./NetworkSelector.css";
import ReloadButtonImage from './reload.svg';
import CloseButtonImage from './close.svg';
import AddNodeButtonImage from './add_node.svg';
export default function(props) {
  
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  
  const onHeaderClick = function(){
    if(!menuIsOpen) {
      setMenuIsOpen(true);
    }
  }
  
  const closeMenu = function() {
    setMenuIsOpen(false);
  }
  
  // Create an array of NetworkSelectorItems from the node list
  let selectorItems = props.nodes.map(function(item, index){
    return(
      <NetworkSelectorItem 
        networkStatus = {item.status}
        networkAddress = {item.address}
        key = {index}
      / >
    );
  })
  
  // Insert the network selector header bar at the beginning of the selectorItems array
  selectorItems.unshift();
  
  // blackout_screen: a translucent black background that serves to "fade out" the main page while the menu is open
  
  let clickFunction;
  /* 
   * The name of the CSS class (is_hidden) that sets the visibility of an 
   * element within the network selector to "hidden"
   */
  let visibilityClassname; 
  if(!menuIsOpen){
    clickFunction = onHeaderClick;
    visibilityClassname = "is_hidden"
  }
    
  return (
    <>
      <div 
        className = {"blackout_screen " + visibilityClassname}
        onClick = {closeMenu}
      >
      </div>
      <div className = "network_selector">
        <div 
          className = "network_selector_item network_selector_header"
          onClick = {clickFunction}
        >
          <img src = {CloseButtonImage} alt = "Close Button" />
          Select a node
          <img src = {ReloadButtonImage} alt = "Reload Button" />
          <img src = {AddNodeButtonImage} alt = "Add Node Button" />
        </div>
        <div 
          className = {"network_selector_items_container " + visibilityClassname}
        >
          {selectorItems}
        </div>
      </div>
    </> 
  )
}

function NetworkSelectorItem (props){
  /*
   * **PROPS**
   * networkStatus
   * networkAddress
   */
   
   console.log("Rendering node " + props.networkAddress);
   
  return(
    <div className = "network_selector_item">
      {props.networkAddress}
      <div className = "connection-indicator-circle">
      </div>
    </div>
  )
}