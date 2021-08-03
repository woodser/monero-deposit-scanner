import React, {useState, useRef} from 'react';
import "./PageTextEntry.css";

export default function (props) {
  
  const [value, setValue] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const isDefault = useRef(true);

  
  const setText = function(text){
    setDisplayedText: text
  }
  
  const handleClick = function() {
    setValue("")
    props.handleClick();
  }

  const handleChange = function(e){
    console.log("onChange");
    setValue(e.target.value);
    if (e.target.value === "") {
      isDefault.current = true;
      
    } else{
      isDefault.current = false;
    }
    if(props.handleTextChange != undefined){
      props.handleTextChange(e.target.value);
    } 
  }
    
    
    let className = props.className + 
      " text_box page_text_box " + 
      ((isDefault.current) ? " default_value" : " new_value") +
      // Use the "active" border either if the input is valid or if there IS NO input
      ((props.isValid || isDefault.current ? " active_border" : " inactive_border"));
    
    let element = null;
    let newValue = "";
    if(props.overrideValue) {
      newValue = props.overrideValue;
    } else if(!(value === "")){
      if(props.overrideValue === null || props.overrideValue === undefined){
        newValue = value;
      }
    }
    
    if (props.isSingleLineEntry){
      className = className + " single_line_text_entry";
      element = (
        <input
          type="text"
          className={className}
          onKeyPress = {props.handleKeyPress}
          onChange={handleChange}
          disabled={!props.isactive}
          value = {newValue}
          placeholder = {props.defaultValue}
          onClick = {props.handleClick}
          style = {props.style}
        />
      );
    } else {
      element = (
        <textarea
          className={className}
          onKeyPress = {props.handleKeyPress}
          onChange={handleChange} 
          disabled={!props.isactive}
          value = {newValue === "" ? undefined : newValue}
          onClick = {props.handleClick}
          placeholder = {props.defaultValue}
          style = {props.style}
        />
      );
    }
    
    return (
      element
    );
}