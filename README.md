# PulseBet

Live prediction markets with instant, gasless betting powered by Yellow Network.

## Problem

Prediction markets today are slow and expensive.
Each bet requires an on-chain transaction, making live or in-play betting impractical.

## Solution

PulseBet uses Yellow Network state channels to let users:

- Deposit once
- Place many bets instantly off-chain
- Settle final balances on-chain in one transaction

## How it works

1. User opens a Yellow session with USDC
2. Bets are placed instantly off-chain
3. Balances update in real time
4. Session settles on-chain at the end

## Why Yellow Network

Yellow enables session-based, trust-minimized off-chain transactions with on-chain security.
Without Yellow, this UX is impossible.

## Tech Stack

- Yellow SDK / Nitrolite
- React / Next.js
- Node.js backend (market logic)
- EVM smart contracts
