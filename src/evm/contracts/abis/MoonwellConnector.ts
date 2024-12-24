export const MoonwellConnectorAbi = {
  abi: [
    {
      inputs: [
        { internalType: "string", name: "name", type: "string" },
        {
          internalType: "enum IConnector.ConnectorType",
          name: "connectorType",
          type: "uint8",
        },
        { internalType: "address", name: "_strategy", type: "address" },
        { internalType: "address", name: "_engine", type: "address" },
        { internalType: "address", name: "_oracle", type: "address" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "connectorName",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "connectorType",
      outputs: [
        {
          internalType: "enum IConnector.ConnectorType",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "engine",
      outputs: [
        { internalType: "contract IEngine", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "enum IConnector.ActionType",
          name: "actionType",
          type: "uint8",
        },
        { internalType: "address[]", name: "assetsIn", type: "address[]" },
        { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        { internalType: "address", name: "assetOut", type: "address" },
        { internalType: "uint256", name: "stepIndex", type: "uint256" },
        { internalType: "uint256", name: "amountRatio", type: "uint256" },
        { internalType: "bytes32", name: "strategyId", type: "bytes32" },
        { internalType: "address", name: "userAddress", type: "address" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "execute",
      outputs: [
        { internalType: "address", name: "", type: "address" },
        { internalType: "address[]", name: "", type: "address[]" },
        { internalType: "uint256[]", name: "", type: "uint256[]" },
        { internalType: "address", name: "", type: "address" },
        { internalType: "uint256", name: "", type: "uint256" },
        { internalType: "address[]", name: "", type: "address[]" },
        { internalType: "uint256[]", name: "", type: "uint256[]" },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "getConnectorName",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getConnectorType",
      outputs: [
        {
          internalType: "enum IConnector.ConnectorType",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "oracle",
      outputs: [
        { internalType: "contract IOracle", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "strategyModule",
      outputs: [
        { internalType: "contract ILiquidStrategy", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
} as const;
