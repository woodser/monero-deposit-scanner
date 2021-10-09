import React from 'react';
import "./ProgressBar.css";

/*
 * This is a generic progress bar component.
 * It displays:
 *  1. A progress bar representing the percentage passed in as the prop "progress".
 *  2. Any elements passed in as childern on top of/in front of the progress bar
 *     (for example text labels or percentage readouts, load/wait, animations, etc).
 */
 
export default function(props) {
  
  // Set the width of the progress bar indicator
  const progressStyle = {
    width: props.progress.toString()
  }
  
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