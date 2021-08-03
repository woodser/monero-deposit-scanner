import React from "react";
import "./TransactionTable.css";
import { Transaction } from "../GlobalTypes";

        //timeStamp: number,
        //amount: number,
        //fee: number,
        //height: number,
        //txHash: string

type TransactionTableProps = {
  transactions: Transaction[];
}

export default function({transactions}: TransactionTableProps){

  const TABLE_HEADER_JSX =
    <tr key = "Header">
      <th>Timestamp</th>
      <th>Amount</th>
      <th>Fee</th>
      <th>Height</th>
      <th>Transaction Hash</th>
    </tr>
    
  let tableDataJsx = transactions.map((tx) => 
    <tr key = {tx.toString()}>
      <td>{tx.timeStamp}</td>
      <td>{tx.amount}</td>
      <td>{tx.fee}</td>
      <td>{tx.height}</td>
      <td>{tx.txHash}</td>
    </tr>
  )
  console.log("tableDataJsx: " + tableDataJsx.toString());
  // Add together the header and transaction arrays for form a complete table
  let tableJsx = [TABLE_HEADER_JSX].concat(tableDataJsx);

  return(
    <table>
      <tbody>
        {tableJsx}
      </tbody>
    </table>
  )
}