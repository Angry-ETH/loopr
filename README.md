# Loopr

**Loopr** is an experimental Web3 social project that explores interaction mechanisms based on non-transferable tokens (SSBTs). Through lightweight operations such as **follow**, **sublimate**, and **share**, it aims to prototype a spiritually-driven social network. The project is currently in the **Proof of Concept (PoC)** stage.

---

## 💡 Core Concept

### 1. SSBT (Sublimable Soul Bound Token)

SSBT is a **sublimable**, soul-bound token representing a user’s **spiritual value**. Its design includes:

- **Non-transferable**: Cannot be traded on markets, avoiding incentive misalignment caused by financial speculation;
- **Inflatable**: Anyone can mint SSBT for any address by transferring ERC20;
- **Sublimable**: Users can "sublimate" their SSBTs, redistributing them to followed users while receiving ERC20 rewards.

---

## 🚀 Modules Overview

### Smart Contracts (`contracts/`)

Written in Cairo and deployed on Starknet, the contract suite includes:

- `SSBTToken`: Implements follow/unfollow logic, SSBT distribution and sublimation, ERC20 reward emission, and admin control;
- Access control: Uses OpenZeppelin’s `OwnableComponent` for on-chain permission management.

### Frontend (`frontend/`)

Built with React and integrated with Starknet using Starknet React Hooks for seamless on-chain interaction.

### Scripts (`scripts/`)

Deployment and verification scripts to initialize contracts and facilitate frontend integration:

- Contract declaration, deployment, and utility helpers
- Optimized for local testing and CI deployment pipelines

---

## 🛠 Tech Stack

- Cairo 1.0 (Smart contract language for Starknet)
- OpenZeppelin Cairo Contracts
- Starknet Foundry (`snforge` testing framework)

---

## 🧪 Development Workflow

### Contract Development

```bash
cd packages/contracts
```

### Build and test

```bash
scarb build
snforge test
```

### Example deployment

```bash
cd scripts
yarn deploy
```

---

## **📚 Reference**

[unruggable.meme](https://github.com/keep-starknet-strange/unruggable.meme)

[Loopr: Incentive-Compatible Decentralized Social Protocol](https://www.notion.so/Loopr-Incentive-Compatible-Decentralized-Social-Protocol-1736942d143081c88191d25009a34213?pvs=21)