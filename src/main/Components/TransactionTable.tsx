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
  console.log("there are " + transactions.length + "TXs");
  const TABLE_HEADER_JSX =
    <tr key = "Header">
      <th>Timestamp</th>
      <th>Amount</th>
      <th>Fee</th>
      <th>Height</th>
      <th>Transaction Hash</th>
    </tr>
    
  let tableDataJsx = transactions.map((tx, index) => 
    <tr key = {index}>
      <td>{tx.timeStamp}</td>
      <td>{tx.amount}</td>
      <td>{tx.fee}</td>
      <td>{tx.height}</td>
      <td className = "expandable_hash">{tx.txHash}</td>
    </tr>
  )

  return(
    <table>
      <colgroup>
        <col span={1} className = "timestamp" />
        <col span={1} className = "amount" />
        <col span={1} className = "fee" />
        <col span={1} className = "height" />
        <col span={1} className = "hash" />
      </colgroup>
      <thead>
        {TABLE_HEADER_JSX}
      </thead>
      <tbody>
        {tableDataJsx}
      </tbody>
    </table>
  )
}