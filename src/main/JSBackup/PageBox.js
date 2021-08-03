import React from 'react';

export default function PageBox(props) {
  
  let boxWidth;
  let bgColor;
  
  if (props.boxWidth === undefined) boxWidth = "200px";
  if (props.bgColor === undefined) bgColor = "red";
  
  if(props.boxWidth !== undefined && props.boxWidth !== null){
    boxWidth = props.boxWidth;
  }
  if(props.backgroundColor !== undefined && props.backgroundColor !== null){
    bgColor = props.bgColor;
  }
  
  return (
    <div 
      className={"page_box " + props.className}
      style = {{width: boxWidth, backgroundColor: bgColor}}
    >
      {props.children}
    </div>
  );
}