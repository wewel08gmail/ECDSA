import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import {utf8ToBytes} from "ethereum-cryptography/utils";
import {keccak256} from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey, signature, setSignature}) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");  
  const setValue = (setter) => (evt) => setter(evt.target.value);


  async function transfer(evt) {
    evt.preventDefault();

    try {

       // Prompt the user to sign the message using their private key
       const userSignature = prompt("Please enter your signature:");             
       const messageHash = keccak256(utf8ToBytes(userSignature));              
       const signature = secp.secp256k1.sign(messageHash, privateKey);              
       setSignature(signature);       
       
        const signature_r_str = signature.r.toString();
        const signature_s_str = signature.s.toString();        
        const signature_recovery = signature.recovery;
        console.log(secp.secp256k1.verify(signature, messageHash, '02bee0e170ccebf37132b48342ae7d12b8e0dddf2de22dcd69930e6dcca2e8ed20'));
        console.log(address)
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        msg: userSignature,
        signature_r: signature_r_str,
        signature_s: signature_s_str,
        signature_recovery: signature_recovery,
      });      
      setBalance(balance);
    } catch (ex) {
      //alert(ex.response.data.message);
      alert(ex);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
