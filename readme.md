# AI Agents Launchpad

**AI Agents Launchpad** is a platform that enables users to create, manage, and utilize AI-driven agents to perform decentralized finance (DeFi) tasks across multiple blockchain networks. These agents can handle tasks such as trading memecoins, providing liquidity, and investing in DeFi protocols, making it easier to automate and optimize strategies in the dynamic DeFi ecosystem. The system leverages the **GOAT SDK**, **Eliza** and **Coinbase AgentKit** to offer seamless agent management and transaction execution.

## Features

### 1. **Agent Creation Flow**
Users can create customized AI agents for different DeFi functions:
- **Trading Memecoins:** Create agents that trade on **Base** and **Solana** networks, with adjustable price ranges for buying and selling.
- **Providing Liquidity:** Set up agents to provide liquidity on **Aerodrome**, with customizable price ticks, amounts, and durations.
- **DeFi Investments:** Build agents to perform automated investments in protocols like **Moonwell** and **Morpho**.
- **Custom Strategies for Liquid Protocol:** Create agents that implement unique strategies for the **Liquid protocol**.

Users can also personalize the agent's character, selecting a function-focused persona such as a market analyst for trading or a sustainability-oriented personality for liquidity provision.

### 2. **Agent Token Creation**
Each agent is associated with a unique token (e.g., **$YUKI**) paired with the **$LIQUID** token. These tokens are minted when the agent reaches a set market cap (e.g., $200k). The agent token can be used in liquidity pools, which are locked for long-term stability. This ensures trust in the agent and helps maintain liquidity and value.

### 3. **Payment Model**
The system uses a **Per-Inference Payment** model. Each time an agent performs an action (e.g., executing trades, providing liquidity, or making investments), users pay using **$LIQUID** tokens. Payments are processed on-chain directly from the user’s wallet to the agent’s wallet, incentivizing agents to perform actions that benefit the user.

### 4. **Agent Management Dashboard**
The **Agent Management Dashboard** offers users full control over their agents:
- **Agent Performance Tracking:** View metrics like profit and loss (P&L), liquidity pool status, and other agent performance data.
- **Real-Time Risk Management:** Modify the agent’s risk settings in real-time to adapt to changing market conditions.
- **Liquidity Management:** Manage liquidity pools by adding or removing liquidity as needed.
- **Token and Wallet Management:** Monitor and manage the agent’s wallet balance, token status, and liquidity pool details.

### 5. **Character Customization**
Using **Eliza’s** natural language processing (NLP) capabilities, users can design their agent’s personality. The agent can be customized to communicate in a tone and style that fits the user's needs. For example:
- A trading agent can have a persona based on a market analyst.
- A liquidity provider agent could focus on sustainability and long-term growth.
- A DeFi investor agent could adapt its tone based on risk tolerance.

The agent can learn from interactions with the user, evolving over time to improve its responses and strategies.

## Benefits
- **Customization:** Tailor agents to specific DeFi functions, risk profiles, and personalities.
- **Automation:** Automate trading, liquidity provisioning, and investment strategies for more efficient portfolio management.
- **Security & Stability:** Long-term liquidity pools ensure stability, and all payments are securely processed on-chain.
- **User Engagement:** The integration of NLP provides a more human-like interaction, enhancing the user experience.
- **Scalability:** The platform is built to scale and integrate with future DeFi protocols and user needs.

---

## How to run the project

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
