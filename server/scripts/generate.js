const secp = require("ethereum-cryptography/secp256k1");
const {toHex} = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.secp256k1.utils.randomPrivateKey();

console.log('private key:', toHex(privateKey));

const publicKey = secp.secp256k1.getPublicKey(privateKey);
//only get the last 20 chars of the public key keccak hash then print in hex
//const publicKey = keccak256(secp.secp256k1.getPublicKey(privateKey).slice(1)).slice(-20);

console.log('public key:', toHex(publicKey));