# **AI Agent Launchpad - Project Structure & Architecture Overview**

This repository provides a **modular architecture** for creating and managing AI-driven DeFi agents. Below is an overview of each folder and file, along with the **data flow** and **responsibilities** of major components.

---

## **Folder Structure**

```
src/
├── actions/
│   ├── defi/
│   ├── liquidity/
│   └── trading/
├── api/
├── core/
│   ├── goal.ts
│   ├── memory.ts
│   ├── runtime.ts
│   └── types.ts
├── database/
│   ├── adapters/
│   └── models/
├── evaluators/
├── providers/
│   ├── BlockchainProvider.ts
│   ├── GoatProvider.ts
│   ├── AgentKitProvider.ts
│   └── ElizaProvider.ts   <-- Eliza logic as a "provider"
├── services/
│   ├── agents/
│   │   └── agents.ts
│   ├── character/
│   │   └── character.ts
│   ├── payment/
│   └── wallet/
│       ├── privy.ts
│       └── turnkey.ts
├── index.ts
├── network.ts
└── .env
```

### **High-Level Flow**

1. **Requests** arrive via the **`api/`** layer (REST/GraphQL).  
2. The **API** routes them to **services** (e.g., `AgentService`, `CharacterService`), which contain the **application logic**.  
3. Services **utilize**:
   - **Core** logic (agent runtime, memory).  
   - **Actions** for DeFi/trading operations.  
   - **Evaluators** to assess risk and performance.  
   - **Providers** (Goat, AgentKit, **Eliza** for NLP, etc.) to integrate with external libraries.  
   - **Database** to store agent data, transaction logs, or user info.  
4. **Responses** return through **`api/`** to the client.

---

## **Folders & Responsibilities**

### **1. `actions/`**
Houses **action-specific logic** for DeFi operations. Subfolders:

- **`defi/`** – Investment or yield-farming actions.  
- **`liquidity/`** – Providing/removing liquidity (e.g., on Aerodrome).  
- **`trading/`** – Buying/selling tokens on supported chains (Base, Solana, etc.).

Actions define **atomic tasks** (e.g., “buy token X”) that the **runtime** or **services** can execute.

---

### **2. `api/`**
All **controllers** or **route definitions** for incoming requests. This is typically where you define your HTTP endpoints or GraphQL resolvers. 

**Example**: An endpoint `/agents/create` that calls the `AgentService` to create a new AI agent.

---

### **3. `core/`**
Contains **foundational logic** for how agents function internally.

- **`goal.ts`** – High-level objectives or goals assigned to agents (e.g., “maximize yield,” “accumulate memecoins”).  
- **`memory.ts`** – Tools or classes for **agent memory**, storing conversation logs or past actions.  
- **`runtime.ts`** – The **AgentRuntime**, controlling how the agent executes actions, updates state, and optionally runs on a schedule.  
- **`types.ts`** – Shared **TypeScript** interfaces and types used in `core`.

This layer is the **heart** of the AI agent’s state management and execution cycle.

---

### **4. `database/`**
All **database-related logic**:

- **`adapters/`**: Database connection or ORM setup (e.g., Postgres, Redis).  
- **`models/`**: Entity definitions for **Agents**, **Transactions**, or other persistent data. (Could be Sequelize, TypeORM, Prisma, etc.)

---

### **5. `evaluators/`**
Contains **evaluation logic** that checks or scores various aspects of agent behavior:

- **RiskEvaluators** – Ensure trades or actions stay within user-defined risk bounds.  
- **PerformanceEvaluators** – Compute P&L, ROI, or other metrics.

These get called either **before** or **after** actions to validate feasibility or measure outcomes.

---

### **6. `providers/`**
Where **external integrations** and **third-party libraries** live:

- **`GoatProvider.ts`** – Handles GOAT SDK calls.  
- **`AgentKitProvider.ts`** – Handles Coinbase AgentKit calls.  
- **`BlockchainProvider.ts`** – Offers a unified way to interact with multiple blockchains.  
- **`ElizaProvider.ts`** – Implements the **Eliza** NLP logic or calls out to an Eliza-like engine.

Treating **Eliza** as a **provider** ensures your core/application layers don’t directly depend on its internal NLP details.

---

### **7. `services/`**
**Application-layer services** orchestrating higher-level logic:

1. **`agents/agents.ts`**  
   - Typically an **AgentService** that **creates** and **manages** AI agents.  
   - Interacts with the **runtime** in `core/`, updates the DB, and coordinates actions/evaluations.

2. **`character/character.ts`**  
   - A **CharacterService** that orchestrates persona- or dialogue-related logic.  
   - Talks to the **ElizaProvider** to generate or process text-based interactions if the user converses with the agent.

3. **`payment/`**  
   - A **PaymentService** for the **per-inference** or **per-action** fee model, handling $LIQUID transfers or checks.

4. **`wallet/`**  
   - **Wallet integration** (e.g. `turnkey.ts`, `privy.ts`) for agent wallet creation, key management, and transaction signing.

**Note**: Additional services (e.g., `TokenService`, `LiquidityService`) might be added here as your DeFi functionality expands.

---

### **Other Files**

- **`index.ts`** / **`network.ts`** – Often used for top-level setup, environment bootstrapping, or network configuration.  
- **`.env`** – Environment variables (secrets, RPC endpoints, etc.). Make sure it’s **excluded** from version control.

---

## **Execution Flow**

1. **API Request → `services/`**  
   A user or client calls an endpoint (e.g., “Create agent”). The **API** layer forwards this to `AgentService`.

2. **`AgentService`** Orchestration  
   - Interacts with **AgentRuntime** (from `core/runtime.ts`) to instantiate or manage an in-memory agent.  
   - Calls **database models** to persist agent data, transaction logs, or config.  
   - Optionally charges user for the action via `PaymentService`.

3. **`actions/` + `providers/`**  
   If an agent must **buy a token** or **provide liquidity**, the service or runtime calls the relevant **action**. That action uses a **provider** (like `BlockchainProvider`) to send on-chain transactions or handle DeFi protocol steps.

4. **Eliza** as a Provider  
   - If the agent needs to produce a persona-based response, `CharacterService` calls **`ElizaProvider`**.  
   - The provider runs the Eliza logic and returns text.  
   - `CharacterService` might update `memory.ts` to store the conversation context.

5. **Result**  
   The **service** compiles the final response (e.g., success, updated agent data, or textual output from Eliza) and returns it back through the **API** to the user.

---

## **Why Eliza in `providers/`?**

Treating Eliza as a provider:

- **Keeps your core & domain layers clean** of direct NLP library dependencies.  
- **Allows easy swap** to a different NLP engine in the future.  
- **Maintains consistent architecture** with GOAT, AgentKit, and other external integrations.

---

## **Key Benefits of This Layout**

- **Modularity**: Each module has a focused responsibility (services for orchestration, actions for tasks, providers for external logic).  
- **Separation of Concerns**: High-level logic remains in `services/`, while the agent’s internal state is in `core/`.  
- **Scalability**: Straightforward to add new chains, new DeFi actions, or advanced features (e.g., more sophisticated persona logic).  
- **Testability**: Each piece (runtime, actions, providers) can be unit-tested or mocked in isolation.

---

### **Getting Started**

1. **Install Dependencies**:  
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Configure Environment**:  
   - Copy `.env.example` to `.env` and populate relevant secrets/RPC endpoints.
3. **Launch**:  
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. **Test**:  
   ```bash
   npm run test
   # or
   yarn test
   ```

---

## **Conclusion**

This structure ensures **clean boundaries** between your AI logic, DeFi actions, and external integrations (including Eliza’s NLP). By isolating Eliza in the **providers** layer, you maintain flexibility to evolve or swap out your NLP solution while keeping the rest of the codebase stable and maintainable.