                               +-------------------------------+
                             |       User Interface / API    | 
                             |       (src/api/)              |
                             +--------------+-----------------+
                                            |
                                            v
                             +-------------------------------+
                             |    Services: Agents           |
                             |   (src/services/agents.ts)     |
                             |  - AgentService                |
                             +--------------+-----------------+
                                            |
                                            |  Creates & configures agents
                                            v
                             +-------------------------------+
                             |    Services: Character        |
                             | (src/services/character.ts)    |
                             |  - CharacterService            |
                             +--------------+-----------------+
                                            |
                                    Persona requests & responses 
                                            v
                             +-------------------------------+
                             |   providers/ElizaProvider.ts  |
                             |   (Implements Eliza or LLM)    |
                             +--------------+-----------------+
                                            ^
                                            |
                     +-----------------------------------------------+
                     |          Core: Runtime & Memory               |
                     |        (src/core/runtime.ts, memory.ts)       |
                     | - AgentRuntime orchestrates agent state       |
                     | - Memory/Goal for conversation/history         |
                     +--------------+---------------------------------+
                                            |
                                            |  Executes DeFi tasks
                                            v
      +--------------------------------------+------------------------------------+
      |                                Actions (src/actions/)                    |
      |  trading/, liquidity/, defi/ -- each define atomic DeFi operations       |
      |  (BuyAction, SellAction, AddLiquidityAction, etc.)                      |
      +--------------------------------------+------------------------------------+
                                            |
                                            |  On-chain calls
                                            v
      +--------------------------------------+------------------------------------+
      |               Providers (src/providers/)                                 |
      |  - BlockchainProvider.ts  (RPC or on-chain interactions)                 |
      |  - GoatProvider.ts       (GOAT SDK)                                      |
      |  - AgentKitProvider.ts   (Coinbase AgentKit)                             |
      |  - Turnkey/Privy         (Wallet solutions)                              |
      +--------------------------------------+------------------------------------+
                                            |
                                            |  Executes transactions 
                                            v
                                     [   Blockchains   ]
                                            |
                                            |  Logs & P&L data
                                            v
      +--------------------------------------+------------------------------------+
      | Data & Analytics + Database (src/database/, src/evaluators/)             |
      | - adapters/ (PostgresAdapter, RedisAdapter)                              |
      | - models/ (Agents, Transactions, Memory, etc.)                           |
      | - evaluators/ (RiskEvaluator, PerformanceEvaluator)                      |
      +----------------------------------------------------------------------------+


  
  --         [User Interface / API]
  --                 |
  --                 v
  --  +----------------------------------+
  --  |         Controller Layer         | <-- Coordinates requests & responses
  --  +----------------------------------+
  --                 |
  --                 v
  --  +----------------------------------+
  --  |  Agent Management Service (DB)   | <-- Creates & configures agents
  --  +----------------------------------+
  --           |               \
  --           |                v
  --           |         +--------------------+
  --           |         |   NLP / Persona   | <-- Eliza/Virtual
  --           |         |   (Microservice)  |
  --           |         +--------------------+
  --           |                     ^
  --           |                     | (Persona requests)
  --           |                     |
  --           v                     |
  --  +----------------------+       |
  --  |    AI Agents         | <-----+
  --  | (Agent Engine Layer) |  <-- Logic that calls Eliza for dialogue 
  --  |  - Strategy logic    |  <-- or persona-based responses to user
  --  |  - Risk checks       |
  --  +----------------------+
  --        | (transactions)
  --        v
  --    [Blockchains]
  --      ^           \
  --      |            \
  --      |   +---------------------+
  --      |   | Payment/Fees Layer | <-- On-chain fee handling in $LIQUID
  --      |   +---------------------+
  --      |
  --      +---+--------------------------+
  --          | Data & Analytics Layer  |
  --          | - Stores TX logs, P&L   |
  --          | - Off-chain data        |
  --          +--------------------------+
