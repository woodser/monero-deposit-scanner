import React from 'react';
import "./ProgressBar.css";
export default function(props) {
  
  // Set the width of the progress bar indicator
  const progressStyle = {
    width: props.progress.toString() + "%"
  }
  
  console.log("props.progress: " + props.progress);
  
  return(
    <div className = {props.className}>
      <div 
        className = "progress_bar" 
        style = {progressStyle}
      >
      </div>
      {props.children}
    </div>
  );
}