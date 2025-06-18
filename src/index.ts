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
import { LearningHourGenerator } from "./LearningHourGenerator";
import { RepositoryAnalyzer } from "./RepositoryAnalyzer";
import { TechStackAnalyzer } from "./TechStackAnalyzer";
import { GitHubMCPClient } from "./GitHubMCPClient";
import { MiroIntegration } from "./MiroIntegration";

const GenerateSessionInputSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  style: z.string().optional().default('slide'),
});

const GenerateCodeExampleInputSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  language: z.string().optional().default("javascript"),
});

const AnalyzeRepositoryInputSchema = z.object({
  repositoryUrl: z.string().min(1, "Repository URL is required"),
  codeSmell: z.string().min(1, "Code smell type is required"),
});

const AnalyzeTechStackInputSchema = z.object({
  repositoryUrl: z.string().min(1, "Repository URL is required"),
});

const CreateMiroBoardInputSchema = z.object({
  sessionContent: z.any(),
  existingBoardId: z.string().optional(),
});

export class LearningHourMCP {
  private server: Server;
  private generator: LearningHourGenerator;
  private repositoryAnalyzer: RepositoryAnalyzer;
  private techStackAnalyzer: TechStackAnalyzer;
  private githubClient: GitHubMCPClient;
  private miroIntegration?: MiroIntegration;

  constructor() {
    this.generator = new LearningHourGenerator();
    this.githubClient = new GitHubMCPClient();
    this.repositoryAnalyzer = new RepositoryAnalyzer(this.githubClient);
    this.techStackAnalyzer = new TechStackAnalyzer(this.githubClient);
    this.initializeGitHubClient();
    this.initializeMiroIntegration();
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


  private async initializeGitHubClient() {
    try {
      await this.githubClient.connect();
      console.error("GitHub MCP client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize GitHub MCP client:", error);
      console.error("Repository analysis will use fallback mode");
    }
  }

  private initializeMiroIntegration() {
    if (process.env.MIRO_ACCESS_TOKEN) {
      this.miroIntegration = new MiroIntegration(process.env.MIRO_ACCESS_TOKEN);
      console.error("Miro API integration initialized");
    } else {
      console.error("MIRO_ACCESS_TOKEN not set, Miro board creation will be unavailable");
    }
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
          description: "Create a new Miro board OR add frames to an existing board. This tool uses the Miro REST API to create boards with frames, sticky notes, text, and code blocks. It can create standalone boards or add content to existing boards.",
          inputSchema: {
            type: "object",
            properties: {
              sessionContent: {
                type: "object",
                description: "Session content from generate_session output",
              },
              existingBoardId: {
                type: "string",
                description: "Optional: ID of an existing Miro board to add frames to. If not provided, creates a new board.",
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
        {
          name: "list_miro_boards",
          description: "List all Miro boards accessible with the current token",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Maximum number of boards to return (default: 50, max: 50)",
              },
              cursor: {
                type: "string",
                description: "Cursor for pagination",
              },
            },
          },
        },
        {
          name: "get_miro_board",
          description: "Get details about a specific Miro board",
          inputSchema: {
            type: "object",
            properties: {
              boardId: {
                type: "string",
                description: "ID of the Miro board to get details for",
              },
            },
            required: ["boardId"],
          },
        },
        {
          name: "delete_miro_board",
          description: "Delete a Miro board (use with caution!)",
          inputSchema: {
            type: "object",
            properties: {
              boardId: {
                type: "string",
                description: "ID of the Miro board to delete",
              },
              confirm: {
                type: "boolean",
                description: "Must be true to confirm deletion",
              },
            },
            required: ["boardId", "confirm"],
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
          case "list_miro_boards":
            return await this.listMiroBoards(request.params.arguments);
          case "get_miro_board":
            return await this.getMiroBoard(request.params.arguments);
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

  public async generateSession(args: any) {
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
      if (!this.miroIntegration) {
        throw new Error('Miro integration not initialized. Ensure MIRO_ACCESS_TOKEN is set in the environment.');
      }

      let layout;
      if (input.existingBoardId) {
        // Add frames to existing board
        try {
          layout = await this.miroIntegration.addFramesToExistingBoard(input.existingBoardId, input.sessionContent);
        } catch (error) {
          throw new Error(`Failed to add frames to existing board: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        // Create new board
        try {
          layout = await this.miroIntegration.createLearningHourBoard(input.sessionContent);
        } catch (error) {
          throw new Error(`Failed to create new Miro board: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Miro board created successfully!`,
          },
          {
            type: "text",
            text: `Board Name: ${input.sessionContent.miroContent.boardTitle}`,
          },
          {
            type: "text",
            text: `Board ID: ${layout.boardId}`,
          },
          {
            type: "text",
            text: `View Link: ${layout.viewLink || 'https://miro.com/app/board/' + layout.boardId}`,
          },
          {
            type: "text",
            text: `\nThe board includes:\n- Overview section with session description\n- Learning objectives\n- 4C activities (Connect, Concept, Concrete, Conclusion)\n- Discussion prompts\n- Key takeaways`,
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
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('GitHub integration not configured')) {
        return {
          content: [
            {
              type: "text",
              text: `❌ GitHub integration not configured`,
            },
            {
              type: "text",
              text: `To use repository analysis, please set GITHUB_TOKEN in your environment.`,
            },
            {
              type: "text",
              text: `Visit https://github.com/settings/tokens to create a personal access token with 'repo' scope.`,
            },
          ],
        };
      }

      if (errorMessage.includes('No examples')) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ No examples found`,
            },
            {
              type: "text",
              text: errorMessage,
            },
          ],
        };
      }

      throw new Error(`Failed to analyze repository: ${errorMessage}`);
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
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('GitHub integration not configured')) {
        return {
          content: [
            {
              type: "text",
              text: `❌ GitHub integration not configured`,
            },
            {
              type: "text",
              text: `To use tech stack analysis, please set GITHUB_TOKEN in your environment.`,
            },
            {
              type: "text",
              text: `Visit https://github.com/settings/tokens to create a personal access token with 'repo' scope.`,
            },
          ],
        };
      }

      if (errorMessage.includes('Unable to analyze tech stack')) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ Unable to analyze repository`,
            },
            {
              type: "text",
              text: errorMessage,
            },
          ],
        };
      }

      throw new Error(`Failed to analyze tech stack: ${errorMessage}`);
    }
  }

  private async listMiroBoards(args: any) {
    try {
      if (!this.miroIntegration) {
        throw new Error('Miro integration not initialized. Ensure MIRO_ACCESS_TOKEN is set in the environment.');
      }

      const limit = args.limit || 50;
      const cursor = args.cursor;

      const result = await this.miroIntegration.listBoards(limit, cursor);

      const boards = result.data.map((board: any) => ({
        id: board.id,
        name: board.name,
        description: board.description || '',
        viewLink: board.viewLink,
        createdAt: board.createdAt,
        modifiedAt: board.modifiedAt
      }));

      return {
        content: [
          {
            type: "text",
            text: `Found ${boards.length} Miro boards:`,
          },
          {
            type: "text",
            text: boards.map((b: any) => `- ${b.name} (ID: ${b.id})`).join('\n'),
          },
          ...(result.cursor ? [{
            type: "text",
            text: `\nMore boards available. Use cursor: ${result.cursor}`,
          }] : []),
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list Miro boards: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getMiroBoard(args: any) {
    try {
      if (!this.miroIntegration) {
        throw new Error('Miro integration not initialized. Ensure MIRO_ACCESS_TOKEN is set in the environment.');
      }

      const boardId = args.boardId;
      if (!boardId) {
        throw new Error('Board ID is required');
      }

      const board = await this.miroIntegration.getBoardInfo(boardId);

      return {
        content: [
          {
            type: "text",
            text: `Board Details:`,
          },
          {
            type: "text",
            text: `Name: ${board.name}`,
          },
          {
            type: "text",
            text: `ID: ${board.id}`,
          },
          {
            type: "text",
            text: `Description: ${board.description || 'No description'}`,
          },
          {
            type: "text",
            text: `View Link: ${board.viewLink}`,
          },
          {
            type: "text",
            text: `Created: ${board.createdAt}`,
          },
          {
            type: "text",
            text: `Modified: ${board.modifiedAt}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get Miro board: ${error instanceof Error ? error.message : String(error)}`);
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
