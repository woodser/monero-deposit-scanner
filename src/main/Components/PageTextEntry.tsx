import React, {ChangeEvent, MouseEvent, KeyboardEvent, useState, useRef} from 'react';
import "./PageTextEntry.css";
import CSS from "csstype";
type PageTextEntryProps = {
  handleTextChange?: (name: string) => void,
  handleKeyPress?: (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
  className?: string,
  isValid?: boolean,
  isSingleLineEntry?: boolean,
  overrideValue?: string,
  defaultValue?: string,
  isactive?: boolean,
  style?: CSS.Properties
}

export default function ({handleTextChange, className, isValid, isSingleLineEntry, overrideValue, defaultValue, handleKeyPress, isactive, style}: PageTextEntryProps) {
  
  const [value, setValue] = useState("");
  const isDefault = useRef<boolean>(true);

  
  const setText = function(text: string){
    setDisplayedText: text
  }

  const handleChange = function(event: React.ChangeEvent){
    setValue((event.target as HTMLTextAreaElement).value);
    if ((event.target as HTMLTextAreaElement).value === "") {
      isDefault.current = true;
      
    } else{
      isDefault.current = false;
    }
    if(handleTextChange != undefined){
      handleTextChange((event.target as HTMLTextAreaElement).value);
    } 
  }
    
    
    let classname: string = className + 
      " text_box page_text_box " + 
      ((isDefault.current) ? " default_value" : " new_value") +
      // Use the "active" border either if the input is valid or if there IS NO input
      ((isValid || isDefault.current ? " active_border" : " inactive_border"));
    
    let element: JSX.Element;
    let newValue: string = "";
    if(overrideValue) {
      newValue = overrideValue;
    } else if(!(value === "")){
      if(overrideValue === null || overrideValue === undefined){
        newValue = value;
      }
    }
    
    if (isSingleLineEntry){
      classname = classname + " single_line_text_entry";
      element = (
        <input
          type="text"
          className={classname}
          onKeyPress = {handleKeyPress}
          onChange={handleChange}
          disabled={!isactive}
          value = {newValue}
          placeholder = {defaultValue}
          style = {style}
        />
      );
    } else {
      element = (
        <textarea
          className={className}
          onKeyPress = {handleKeyPress}
          onChange={handleChange} 
          disabled={!isactive}
          value = {newValue === "" ? undefined : newValue}
          placeholder = {defaultValue}
          style = {style}
        />
      );
    }
    
    return (
      element
    );
}