import React from 'react';

export default function PageBox(props) {
  
  let boxWidth;
  let bgColor;
  
  if (props.boxWidth === undefined) boxWidth = "200px";
  if (props.bgColor === undefined) bgColor = "red";
  
  if(props.width !== undefined && props.width !== null){
    boxWidth = props.width;
  }
  if(props.backgroundColor !== undefined && props.backgroundColor !== null){
    bgColor = props.backgroundColor;
  }
  
  return (
    <div 
      className={"page_box " + props.className}
      style = {{width: props.boxWidth, backgroundColor: bgColor}}
    >
      {props.children}
    </div>
  );
}