"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>PulseBet</h1>

      {!isConnected ? (
        <button onClick={() => connect({ connector: metaMask() })}>
          Connect Wallet
        </button>
      ) : (
        <>
          <p>
            Connected: <strong>{address}</strong>
          </p>
          <button onClick={() => disconnect()}>
            Disconnect
          </button>
        </>
      )}
    </main>
  );
}
