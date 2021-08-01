import React from "react";
import "./TransactionTable.css";

export default function(props){

  const TABLE_HEADER_JSX =
    <tr key = "Header">
      <th>Timestamp</th>
      <th>Amount</th>
      <th>Fee</th>
      <th>Height</th>
      <th>Transaction Hash</th>
    </tr>
    
   let tableDataJsx = props.transactions.map((tx) => {
    <tr key = {tx.toString()}>
      <td>{tx.timeStamp}</td>
      <td>{tx.amount}</td>
      <td>{tx.fee}</td>
      <td>{tx.height}</td>
      <td>{tx.TxHash}</td>
    </tr>
  })
  
  // Add together the header and transaction arrays for form a complete table
  let tableJsx = [TABLE_HEADER_JSX].concat(tableDataJsx);
  tableJsx = 
    <tbody>
      {tableJsx}
    </tbody>
  return(
    <table>
      {tableJsx}
    </table>
  )
}