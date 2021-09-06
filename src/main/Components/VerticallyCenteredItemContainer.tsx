import React, {FC} from 'react';
import "./VerticallyCenteredItemContainer.css";

type VerticallyCenteredItemContainerProps = {
  className?: string,
  /*
   * React.ReactNode is a catch-all type that allows for data types not included in the
   * JSXElement element type (such as string or number)
   */
  children: React.ReactNode, 
}

const containerComponent: FC<VerticallyCenteredItemContainerProps> = function ({className, children}) {
  return(
    <div className = {className}>
      {children}
    </div>
  )
}

export default containerComponent;