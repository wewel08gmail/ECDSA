const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");
const {toHex} = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

/*
private key: 5cf9254da79a9245ef6a7ab737e56638e40887cf422ca8605cdd46bbc7594852
public key: 02bee0e170ccebf37132b48342ae7d12b8e0dddf2de22dcd69930e6dcca2e8ed20

private key: 3166bfbd220b32d76b1224cc9f4b24a4060dd53b2fd6993e18de6bf7f1f8bd9e
public key: 035821553d8ce5ec4f9fdc69e007d254eaf95607217ad0c029f7760148b427a9e5

private key: 015944eff55f7e3f0717acda454d376db38ce6ad10a9bafc7109a8bb667be166
public key: 0294b508910c0e11791dd9f4fed9362a19061762fe3fc84e9e6ca1b33bd48de80b
*/

const balances = {
  "02bee0e170ccebf37132b48342ae7d12b8e0dddf2de22dcd69930e6dcca2e8ed20": 100,
  "035821553d8ce5ec4f9fdc69e007d254eaf95607217ad0c029f7760148b427a9e5": 50,
  "0294b508910c0e11791dd9f4fed9362a19061762fe3fc84e9e6ca1b33bd48de80b": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {




  const { sender, recipient, amount, msg, signature_r, signature_s, signature_recovery} = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);
    
  const messageHash = keccak256(utf8ToBytes(msg));
  const signature = new secp.secp256k1.Signature(BigInt(signature_r.slice(0)),BigInt(signature_s.slice(0)),signature_recovery);
  
  let publicKey = "";
  let isSigned = false;
  
  //iterate through each address
  Object.entries(balances).forEach(([address, balance]) => {
    
    if (!isSigned) { //signature match
      //return bool
      isSigned = secp.secp256k1.verify(signature, messageHash, address);      
      publicKey = address;
    }

  });


  if(sender != publicKey){
    res.status(400).send({ message: "Not valid signature!" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
