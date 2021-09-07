import React from 'react';
import './PageBox.css';
import '../app.css';
import * as CSS from 'csstype';

// All props are optional
type PageBoxProps = {
  boxWidth?: string,
  bgColor?: string,
  className?: string,
  children?: JSX.Element | JSX.Element[]
}

export default function PageBox({boxWidth, bgColor, className, children}: PageBoxProps) {
  
  let style: CSS.Properties = {};
  
  if(boxWidth !== null && boxWidth !== undefined){
    Object.assign(style, {width: boxWidth});
  }
  
  if(bgColor !== null && bgColor !== undefined) {
    Object.assign(style, {backgroundColor: bgColor});
  }
  
  return (
    <div 
      className={"page_box " + className}
      style = {style}
    >
      {children}
    </div>
  );
}