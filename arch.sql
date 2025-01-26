          [User Interface / API]
                  |
                  v
   +----------------------------------+
   |         Controller Layer         | <-- Coordinates requests & responses
   +----------------------------------+
                  |
                  v
   +----------------------------------+
   |  Agent Management Service (DB)   | <-- Creates & configures agents
   +----------------------------------+
            |               \
            |                v
            |         +--------------------+
            |         |   NLP / Persona   | <-- Eliza/Virtual
            |         |   (Microservice)  |
            |         +--------------------+
            |                     ^
            |                     | (Persona requests)
            |                     |
            v                     |
   +----------------------+       |
   |    AI Agents         | <-----+
   | (Agent Engine Layer) |  <-- Logic that calls Eliza for dialogue 
   |  - Strategy logic    |  <-- or persona-based responses to user
   |  - Risk checks       |
   +----------------------+
         | (transactions)
         v
     [Blockchains]
       ^           \
       |            \
       |   +---------------------+
       |   | Payment/Fees Layer | <-- On-chain fee handling in $LIQUID
       |   +---------------------+
       |
       +---+--------------------------+
           | Data & Analytics Layer  |
           | - Stores TX logs, P&L   |
           | - Off-chain data        |
           +--------------------------+
