import React from 'react';
import "./ProgressBar.css";

/*
 * This is a generic progress bar component.
 * It displays:
 *  1. A progress bar representing the percentage passed in as the prop "progress".
 *  2. Any elements passed in as childern on top of/in front of the progress bar
 *     (for example text labels or percentage readouts, load/wait, animations, etc).
 */
 
type ProgressBarProps = {
  progress: number,
  children?: JSX.Element | JSX.Element[],
  className: string
}
 
export default function({progress, children, className}: ProgressBarProps) {
  
  // Set the width of the progress bar indicator
  const progressStyle = {
    width: progress.toString() + "%"
  }
  console.log("Rendering progress bar with percent: " + progress);
  
  return(
    <div className = {className}>
      <div 
        className = "progress_bar" 
        style = {progressStyle}
      >
      </div>
      {children}
    </div>
  );
}