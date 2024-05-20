const express = require("express");
const app = express();
const cors = require("cors");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "02b7eab5e5c25ff15f779dcbd0d9d11235d73adf9f034ca7d9aaf6de8480c4134f": 100,
  "03a25c2556ab5be6ffbe8690b7f0cb9ac9258fbb2de5c7827b3efd787225c814e0": 50,
  "0220038b30aba185f128b334de07684ad16e145e6976c0d0eba83ab2b519587e09": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;

  const cleanHexSignature = signature.startsWith("0x")
  ? signature.slice(2)
  : signature;

  const rHex = cleanHexSignature.slice(0, 64);
  const sHex = cleanHexSignature.slice(64, 128);
  const recoveryHex = cleanHexSignature.slice(128, 130);

  const r = BigInt("0x" + rHex);
  const s = BigInt("0x" + sHex);
  const recovery = parseInt(recoveryHex, 16);

  const rawSignature = {
    r: r,
    s: s,
    recovery: recovery,
  };

  const bytes = utf8ToBytes("Transact");
  const hash = keccak256(bytes);

  const isSigned = secp256k1.verify(rawSignature, hash, sender);
  console.log("Verified Signature: ", isSigned)

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    if (!isSigned) {
      res.status(400).send({ message: "Wrong Public Key or Signature (check for a space at the begining of the string)" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
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
