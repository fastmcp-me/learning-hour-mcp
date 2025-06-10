#!/usr/bin/env node

import 'dotenv/config';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { MiroIntegration } from "./MiroIntegration.js";
import { LearningHourGenerator } from "./LearningHourGenerator.js";
import { RepositoryAnalyzer } from "./RepositoryAnalyzer.js";
import { TechStackAnalyzer } from "./TechStackAnalyzer.js";

const GenerateSessionInputSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  style: z.string().optional().default('slide'),
});

const GenerateCodeExampleInputSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  language: z.string().optional().default("javascript"),
});

const CreateMiroBoardInputSchema = z.object({
  sessionContent: z.any(),
});

const AnalyzeRepositoryInputSchema = z.object({
  repositoryUrl: z.string().min(1, "Repository URL is required"),
  codeSmell: z.string().min(1, "Code smell type is required"),
});

const AnalyzeTechStackInputSchema = z.object({
  repositoryUrl: z.string().min(1, "Repository URL is required"),
});

class LearningHourMCP {
  private server: Server;
  private generator: LearningHourGenerator;
  private repositoryAnalyzer: RepositoryAnalyzer;
  private techStackAnalyzer: TechStackAnalyzer;

  constructor() {
    this.generator = new LearningHourGenerator();
    this.repositoryAnalyzer = new RepositoryAnalyzer();
    this.techStackAnalyzer = new TechStackAnalyzer();
    this.server = new Server(
      {
        name: "learning-hour-mcp",
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }


  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "generate_session",
          description: "Generate comprehensive Learning Hour content for Technical Coaches",
          inputSchema: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The learning topic (e.g., 'Feature Envy', 'DRY Principle')",
              },
              style: {
                type: "string",
                description: "Presentation style: slide (default), vertical, or workshop",
                default: "slide"
              },
            },
            required: ["topic"],
          },
        },
        {
          name: "generate_code_example",
          description: "Generate detailed before/after code examples for a learning topic",
          inputSchema: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The learning topic (e.g., 'Feature Envy', 'DRY Principle')",
              },
              language: {
                type: "string",
                description: "Programming language for examples (default: javascript)",
                default: "javascript"
              },
            },
            required: ["topic"],
          },
        },
        {
          name: "create_miro_board",
          description: "Create a Miro board from Learning Hour session content (requires valid MIRO_ACCESS_TOKEN)",
          inputSchema: {
            type: "object",
            properties: {
              sessionContent: {
                type: "object",
                description: "Session content from generate_session output",
              },
            },
            required: ["sessionContent"],
          },
        },
        {
          name: "analyze_repository",
          description: "Analyze a GitHub repository to find real code examples for Learning Hours",
          inputSchema: {
            type: "object",
            properties: {
              repositoryUrl: {
                type: "string",
                description: "GitHub repository URL to analyze",
              },
              codeSmell: {
                type: "string",
                description: "Type of code smell to find (e.g., 'Feature Envy', 'Long Method')",
              },
            },
            required: ["repositoryUrl", "codeSmell"],
          },
        },
        {
          name: "analyze_tech_stack",
          description: "Analyze a repository's technology stack to create team-specific Learning Hour content",
          inputSchema: {
            type: "object",
            properties: {
              repositoryUrl: {
                type: "string",
                description: "GitHub repository URL to analyze",
              },
            },
            required: ["repositoryUrl"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case "generate_session":
            return await this.generateSession(request.params.arguments);
          case "generate_code_example":
            return await this.generateCodeExample(request.params.arguments);
          case "create_miro_board":
            return await this.createMiroBoard(request.params.arguments);
          case "analyze_repository":
            return await this.analyzeRepository(request.params.arguments);
          case "analyze_tech_stack":
            return await this.analyzeTechStack(request.params.arguments);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async generateSession(args: any) {
    const input = GenerateSessionInputSchema.parse(args);
    
    try {
      const sessionData = await this.generator.generateSessionContent(input.topic, input.style);

      return {
        content: [
          {
            type: "text",
            text: `✅ Learning Hour session generated for: ${input.topic}`,
          },
          {
            type: "text", 
            text: JSON.stringify(sessionData, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to generate session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async generateCodeExample(args: any) {
    const input = GenerateCodeExampleInputSchema.parse(args);
    
    try {
      const exampleData = await this.generator.generateCodeExample(input.topic, input.language);

      return {
        content: [
          {
            type: "text",
            text: `✅ Code examples generated for: ${input.topic} (${input.language})`,
          },
          {
            type: "text",
            text: JSON.stringify(exampleData, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to generate code example: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async createMiroBoard(args: any) {
    const input = CreateMiroBoardInputSchema.parse(args);
    
    try {
      if (!process.env.MIRO_ACCESS_TOKEN) {
        throw new Error('MIRO_ACCESS_TOKEN environment variable is required');
      }

      const miro = new MiroIntegration(process.env.MIRO_ACCESS_TOKEN);
      const layout = await miro.createLearningHourBoard(input.sessionContent);
      const viewLink = await miro.getBoardViewLink(layout.boardId);

      return {
        content: [
          {
            type: "text",
            text: `✅ Miro board created successfully!`,
          },
          {
            type: "text",
            text: `Board ID: ${layout.boardId}`,
          },
          {
            type: "text",
            text: `View Link: ${viewLink}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to create Miro board: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async analyzeRepository(args: any) {
    const input = AnalyzeRepositoryInputSchema.parse(args);
    
    try {
      const analysisResult = await this.repositoryAnalyzer.analyzeRepository(input.repositoryUrl, input.codeSmell);

      return {
        content: [
          {
            type: "text",
            text: `✅ Repository analysis completed for: ${input.codeSmell}`,
          },
          {
            type: "text",
            text: `Found ${analysisResult.examples.length} examples in ${input.repositoryUrl}`,
          },
          {
            type: "text",
            text: JSON.stringify(analysisResult, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async analyzeTechStack(args: any) {
    const input = AnalyzeTechStackInputSchema.parse(args);
    
    try {
      const techProfile = await this.techStackAnalyzer.analyzeTechStack(input.repositoryUrl);

      return {
        content: [
          {
            type: "text",
            text: `✅ Technology stack analysis completed for: ${input.repositoryUrl}`,
          },
          {
            type: "text",
            text: `Primary languages: ${techProfile.primaryLanguages.join(', ')}`,
          },
          {
            type: "text",
            text: `Frameworks: ${techProfile.frameworks.join(', ')}`,
          },
          {
            type: "text",
            text: JSON.stringify(techProfile, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze tech stack: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Learning Hour MCP server running on stdio");
  }
}

const server = new LearningHourMCP();
server.run().catch(console.error);