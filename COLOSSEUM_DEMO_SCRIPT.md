# 🎙️ SolPay Agent Escrow: 3-Minute Video Pitch & Demo Walkthrough Script

**Target Event:** Colosseum Arena Radar Hackathon ($250k+ Pool) / Superteam Ukraine Demo Day  
**Author:** Dmytro Filonenko ([@yshxspX](https://x.com/yshxspX))  
**Interactive Demo URL:** [https://yshxsp.github.io/solpay-agent-escrow/](https://yshxsp.github.io/solpay-agent-escrow/)  
**GitHub Repo:** [https://github.com/yshxsp/solpay-agent-escrow](https://github.com/yshxsp/solpay-agent-escrow)  
**Target Duration:** 2 minutes 45 seconds (Buffer: 15s)

---

## ⏱️ Video Timeline Breakdown

| Timestamp | Visual on Screen | Speaker Audio / Voiceover |
| :--- | :--- | :--- |
| **0:00 - 0:25** | Title Card + Terminal showing 2 autonomous agents attempting to trade | "Hi everyone. Over the past year, AI agents transitioned from answering questions to executing real tasks—writing code, compiling binaries, and scraping datasets. But when Agent A hires Agent B, how do they settle payment? Web2 banks require human passports. And plain crypto transfers force 100% upfront trust. If the worker agent crashes or hallucinates, the money is gone. This is the counterparty bottleneck of the agentic web. Today, we're introducing **SolPay Agent Escrow**." |
| **0:25 - 0:55** | Switch to Architecture Diagram (`sequenceDiagram`) | "SolPay Agent Escrow is an autonomous, milestone-gated payment and telemetry rail built natively on Solana and exposed directly to LLMs via the Model Context Protocol (MCP). Instead of trusting an opaque counterparty, a buyer agent calls `create_escrow` through MCP. Funds lock into an isolated Program Derived Address (PDA) vault. The worker agent completes the milestone, hashes its test suite assertion outputs with SHA-256, and logs the proof on-chain. Once verification criteria pass, the contract disburses USDC in 400 milliseconds." |
| **0:55 - 1:40** | **Live Demo Walkthrough** at `yshxsp.github.io/solpay-agent-escrow/` | "Let's see this live on our telemetry flight deck. Here on our interactive simulator, you can see live Solana cluster health, current slot height, and ping latencies. Let's create an escrow for an automated code-review task: 50 USDC, 2 milestones. We click **Deploy Escrow Vault**. In 380 milliseconds, the PDA account initializes on devnet. Now, the worker agent executes. Milestone 1 finishes: running Jest test suites. The agent hashes test outputs—`sha256:e3b0c44...`—and calls `submit_proof`. The protocol verifies the assertion hash against expected criteria. Instantly, the milestone unlocks and 25 USDC transfers to the worker's wallet. Zero human intervention." |
| **1:40 - 2:15** | VS Code / GitHub Repository Walkthrough | "Under the hood, this isn't a mock UI. In our repository at `github.com/yshxsp/solpay-agent-escrow`, we have full TypeScript implementations with 100% test coverage. Our Anchor smart contract enforces strict account ownership and PDA signer seeds. The MCP server integrates out of the box with Claude Desktop, Cursor, and custom Gemini pipelines, allowing any agent framework to call `create_escrow`, `submit_proof`, and `claim_milestone` as native agent tools." |
| **2:15 - 2:45** | Return to Flight Deck & Closing Summary | "Solana is the only L1 capable of handling high-frequency agent economies—sub-cent transaction fees and sub-second finality make micro-escrows viable. SolPay Agent Escrow provides the financial trust layer for the next billion autonomous agent transactions. Our code is open source, our live demo is running on GitHub Pages, and our contracts are ready for audit. Thank you!" |

---

## 🎬 Recording Instructions & Assets Checklist

1. **Browser Tab 1**: [https://yshxsp.github.io/solpay-agent-escrow/](https://yshxsp.github.io/solpay-agent-escrow/) (Maximize window, 1080p, 60fps).
2. **Browser Tab 2**: [https://github.com/yshxsp/solpay-agent-escrow](https://github.com/yshxsp/solpay-agent-escrow) (README and tests folder).
3. **Local IDE / Terminal**: `npm test` running in `bounty_workspaces/solana-vibeathon-mvp` showing clean passing tests.
4. **Resolution**: 1920x1080, Clear microphone, No background music or subtle low-fi synth.
