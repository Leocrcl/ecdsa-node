import server from "./server";

function Wallet({signature, setSignature, balance, setBalance, publicKey, setPublicKey}) {
  async function onChange(evt) {
    const publicKey = evt.target.value;
    setPublicKey(publicKey);
    if (publicKey) {
      const {
        data: { balance },
      } = await server.get(`balance/${publicKey}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function onChangeSignature(evt) {
    const signature = evt.target.value;
    setSignature(signature);
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Public Key
        <input
          placeholder="Type a public key"
          value={publicKey}
          onChange={onChange}
        ></input>
      </label>

      <label>
        Signature
        <input
          placeholder="Type in signature"
          value={signature}
          onChange={onChangeSignature}
        ></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;