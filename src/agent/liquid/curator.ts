import { llamaService } from "../../provider/llama";
import {
  ChunkMessage,
  MarketCondition,
  Protocol,
  Step,
  Strategy,
} from "./type";
import { Attachment } from "llama-stack-client/resources";
import LlamaStackClient from "llama-stack-client";

import { AGENT_CONFIG } from "../config";
import {
  ANALYZE_MARKET,
  GENERATE_STRATEGY,
  MONITOR_STRATEGY,
  REVIEW_STRATEGY,
  OUTPUT_TEMPLATE,
  STRATEGY_OUTPUT,
} from "../prompts";

export class LiquidAgentCurator {
  private agent!: LlamaStackClient.Agents;
  private sessionId!: string;
  private agentId!: string;

  constructor() {
    this.initializeAgent();
  }

  async initializeAgent() {
    const client = llamaService.getClient();
    const agentResponse = await client.agents.create({
      // @ts-ignore
      agent_config: AGENT_CONFIG,
    });

    this.agent = client.agents;
    this.agentId = agentResponse.agent_id;

    const session = await this.agent.sessions.create({
      agent_id: this.agentId,
      session_name: "liquid_strategy",
    });
    this.sessionId = session.session_id;
  }

  async analyzeMarketConditions(protocols: Protocol[]): Promise<string> {
    const dataAttachment: Attachment = {
      content: JSON.stringify(protocols, null, 2),
      mime_type: "application/json",
    };

    const stream = await this.agent.turns.create({
      agent_id: this.agentId,
      session_id: this.sessionId,
      stream: true,
      messages: [
        {
          role: "user",
          content: ANALYZE_MARKET,
        },
      ],
      attachments: [dataAttachment],
    });

    return await this.processStream(stream);
  }

  async createStrategy(
    asset: "USDC" | "WETH",
    marketAnalysis: string,
    protocols: Protocol[]
  ): Promise<Strategy | any> {
    const contextAttachment: Attachment = {
      content: JSON.stringify(
        {
          asset,
          protocols,
          market_analysis: marketAnalysis,
        },
        null,
        2
      ),
      mime_type: "application/json",
    };

    const stream = await this.agent.turns.create({
      agent_id: this.agentId,
      session_id: this.sessionId,
      stream: true,
      messages: [
        {
          role: "user",
          content: GENERATE_STRATEGY(asset, marketAnalysis),
        },
      ],
      attachments: [contextAttachment],
    });

    return await this.processStream(stream);
  }

  async monitorStrategy(
    strategy: Strategy,
    currentMarket: MarketCondition
  ): Promise<string> {
    const monitoringData: Attachment = {
      content: JSON.stringify(
        {
          strategy,
          current_market: currentMarket,
        },
        null,
        2
      ),
      mime_type: "application/json",
    };

    const stream = await this.agent.turns.create({
      messages: [
        {
          role: "user",
          content: MONITOR_STRATEGY(strategy.asset),
        },
      ],
      attachments: [monitoringData],
      agent_id: this.agentId,
      session_id: this.sessionId,
      stream: true,
    });

    return await this.processStream(stream);
  }

  async weeklyUpdate(
    strategy: Strategy,
    marketData: MarketCondition
  ): Promise<Strategy | any> {
    const updateData: Attachment = {
      content: JSON.stringify(
        {
          current_strategy: strategy,
          market_data: marketData,
        },
        null,
        2
      ),
      mime_type: "application/json",
    };

    const stream = await this.agent.turns.create({
      messages: [
        {
          role: "user",
          content: REVIEW_STRATEGY(strategy.asset),
        },
      ],
      attachments: [updateData],
      agent_id: this.agentId,
      session_id: this.sessionId,
      stream: true,
    });

    return await this.processStream(stream);
  }

  async generateStrategyOutput(
    asset: "USDC" | "WETH",
    marketAnalysis: string,
    protocols: Protocol[]
  ): Promise<typeof OUTPUT_TEMPLATE> {
    const stream = await this.agent.turns.create({
      agent_id: this.agentId,
      session_id: this.sessionId,
      stream: true,
      messages: [
        {
          role: "user",
          content: STRATEGY_OUTPUT(asset, marketAnalysis, protocols),
        },
      ],
    });

    const strategyOutput = await this.processStream(stream);

    console.log("Raw AI Response:", strategyOutput);

    const jsonMatch = strategyOutput.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No valid JSON detected in AI response.");
    }

    const cleanResponse = jsonMatch[0];
    JSON.stringify(cleanResponse);
    try {
      return JSON.parse(cleanResponse) as typeof OUTPUT_TEMPLATE;
    } catch (error) {
      console.error("Cleaned Response:", cleanResponse);
      throw new Error(`Failed to parse AI response as JSON: ${error}`);
    }
  }

  async processStream(stream1: AsyncIterable<any>): Promise<string> {
    let fullText = "";
    for await (const chunk of stream1) {
      const typedChunk = chunk as any;
      if (typedChunk?.event?.payload?.turn?.steps) {
        const inferenceStep = typedChunk.event.payload.turn.steps.find(
          (step: Step) => step.step_type === "inference"
        );
        if (inferenceStep?.model_response?.content)
          fullText = inferenceStep.model_response.content;
      }
    }

    return fullText;
  }
}
