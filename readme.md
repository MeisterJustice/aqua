# Liquid Agent Curator

An AI Agent strategy curator powered by LlamaStack that automatically generates and deploys yield optimization strategies on Base through the Liquid Protocol.

## Overview

The Liquid AI Curator is an AI Agent that generates and deploys DeFi yield strategies.

## Features

- Automated weekly strategy generation 
- Cross-protocol yield optimization
- Real-time market data analysis
- Risk-assessed strategy deployment
- Safety checks and validations
- Persistent market data storage

## Tech Stack

- **LlamaStack**: AI strategy generation
- **Viem**: Blockchain interactions
- **TypeScript**: Development language
- **Docker**: LlamaStack server deployment

## Project Structure

```text
liquid-ai-curator/
├── src/
│   ├── agent/
│   │   ├── CuratorAgent.ts        # Core agent implementation
│   │   ├── config.ts              # Agent configuration
│   │   ├── prompts.ts             # Strategy generation prompts
│   │   └── types.ts               # Agent & strategy types
│   │
│   ├── evm/
│   │   ├── client.ts              # Viem client setup
│   │   ├── contracts/             
│   │   │   ├── addresses.ts         
│   │   │   └── abis/                       
│   │
│   ├── defi/
│   │   ├── RiskAnalyzer.ts  
│   │
│   ├── memory/                   
│   │   ├── MarketStore.ts         # LlamaStack memory implementation
│   │   └── types.ts              
│   │
│   └── index.ts                   # Entry point
│
├── tests/                         
├── docker-compose.yml             
├── .env.example                   
└── README.md                     
```

## Setup & Installation

### Prerequisites
- Node.js >= 18
- PNPM
- Docker (for LlamaStack)
- Base RPC URL & Private Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/metastable-labs/tele.git
cd tele
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Update `.env` with your values:
```env
LLAMA_STACK_URL=http://localhost:5001
BASE_RPC_URL=your_base_rpc_url
PRIVATE_KEY=your_private_key
```

## Running

1. Start LlamaStack server:
```bash
docker-compose up -d
```

2. Start the curator:
```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## Development

### TypeScript Configuration
```bash
# Run TypeScript in watch mode
pnpm typecheck --watch
```

### Testing
```bash
# Run tests
pnpm test
```

## Production Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start dist/index.js --name tele
```

### Using Docker
```bash
docker build -t tele .
docker run -d tele
```

## Strategy Format

Example of a generated strategy:

```typescript
interface Strategy {
  name: string;
  description: string;
  steps: {
    protocol: string;
    actionType: string;
    assetsIn: string[];
    assetOut: string;
    amountRatio: number;
    data: string;
  }[];
  minDeposit: bigint;
}
```

## License

BSD 3-Clause License

## Support

For support, please open an issue in the repository or reach out through our [Discord community](https://discord.com/invite/getliquid).

---

*This project is maintained by the Liquid Protocol team*