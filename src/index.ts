#!/usr/bin/env node

import 'dotenv/config';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { spawn } from "child_process";
import axios from "axios";
import { LearningHourGenerator } from "./LearningHourGenerator.js";

const GenerateSessionInputSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
});

const GenerateCodeExampleInputSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  language: z.string().optional().default("javascript"),
});

const CreateMiroBoardInputSchema = z.object({
  sessionContent: z.any(),
});

class LearningHourMCP {
  private server: Server;
  private generator: LearningHourGenerator;
  private miroClient: Client | null = null;

  constructor() {
    this.generator = new LearningHourGenerator();
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

  private async initializeMiroClient(): Promise<Client | null> {
    if (this.miroClient) {
      return this.miroClient;
    }

    const miroServerUrl = process.env.MIRO_MCP_SERVER_URL;
    const miroServerPath = process.env.MIRO_MCP_SERVER_PATH;

    if (miroServerUrl) {
      return null;
    } else if (miroServerPath) {
      const childProcess = spawn(miroServerPath, [], {
        stdio: ['pipe', 'pipe', 'inherit'],
      });

      const transport = new StdioClientTransport({
        reader: childProcess.stdout,
        writer: childProcess.stdin,
      });

      this.miroClient = new Client({
        name: "learning-hour-mcp-client",
        version: "1.0.0",
      }, {
        capabilities: {},
      });

      await this.miroClient.connect(transport);
      return this.miroClient;
    } else {
      throw new Error('Either MIRO_MCP_SERVER_URL or MIRO_MCP_SERVER_PATH must be set');
    }
  }

  private async callRemoteMiroTool(toolName: string, args: any): Promise<any> {
    const miroServerUrl = process.env.MIRO_MCP_SERVER_URL;
    if (!miroServerUrl) {
      throw new Error('MIRO_MCP_SERVER_URL not configured');
    }

    try {
      const response = await axios.post(`${miroServerUrl}/tools/call`, {
        name: toolName,
        arguments: args
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      throw new Error(`Remote MCP call failed: ${error instanceof Error ? error.message : String(error)}`);
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
          description: "Create a Miro board from Learning Hour session content using local Miro MCP server",
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
      const sessionData = await this.generator.generateSessionContent(input.topic);

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
      const boardName = input.sessionContent.miroContent?.boardTitle || `Learning Hour: ${input.sessionContent.topic}`;
      const isRemote = !!process.env.MIRO_MCP_SERVER_URL;
      
      let createBoardResult: any;
      if (isRemote) {
        createBoardResult = await this.callRemoteMiroTool("create_board", {
          name: boardName,
          description: input.sessionContent.sessionOverview || "Learning Hour session board"
        });
      } else {
        const miroClient = await this.initializeMiroClient();
        if (!miroClient) {
          throw new Error('Failed to initialize MCP client');
        }
        createBoardResult = await miroClient.request({
          method: "tools/call",
          params: {
            name: "create_board",
            arguments: {
              name: boardName,
              description: input.sessionContent.sessionOverview || "Learning Hour session board"
            }
          }
        });
      }

      let boardId: string;
      if (isRemote) {
        boardId = createBoardResult.board_id || createBoardResult.id;
      } else {
        if (!createBoardResult.content?.[0]?.text) {
          throw new Error('Failed to create Miro board');
        }
        const boardData = JSON.parse(createBoardResult.content[0].text);
        boardId = boardData.id;
      }

      if (!input.sessionContent.miroContent?.sections) {
        throw new Error('No Miro content sections found in session content');
      }

      let currentY = -400;
      const sectionSpacing = 300;
      const itemSpacing = 120;

      for (const section of input.sessionContent.miroContent.sections) {
        const sectionY = currentY;
        currentY += sectionSpacing;

        const sectionTitleArgs = {
          board_id: boardId,
          content: `<h3>${section.title}</h3>`,
          x: -500,
          y: sectionY,
          width: 200,
          height: 60
        };

        if (isRemote) {
          await this.callRemoteMiroTool("create_text", sectionTitleArgs);
        } else {
          const miroClient = await this.initializeMiroClient();
          if (miroClient) {
            await miroClient.request({
              method: "tools/call",
              params: {
                name: "create_text",
                arguments: sectionTitleArgs
              }
            });
          }
        }

        if (section.type === 'text_frame') {
          const textFrameArgs = {
            board_id: boardId,
            content: `<h2>${section.title}</h2><p>${section.content}</p>`,
            x: -200,
            y: sectionY,
            width: 600,
            height: 150
          };

          if (isRemote) {
            await this.callRemoteMiroTool("create_text", textFrameArgs);
          } else {
            const miroClient = await this.initializeMiroClient();
            if (miroClient) {
              await miroClient.request({
                method: "tools/call",
                params: {
                  name: "create_text",
                  arguments: textFrameArgs
                }
              });
            }
          }
        } else if (section.type === 'sticky_notes' && section.items) {
          let currentX = -400;
          for (const item of section.items) {
            const stickyNoteArgs = {
              board_id: boardId,
              content: item,
              x: currentX,
              y: sectionY,
              color: section.color || 'light_yellow'
            };

            if (isRemote) {
              await this.callRemoteMiroTool("create_sticky_note", stickyNoteArgs);
            } else {
              const miroClient = await this.initializeMiroClient();
              if (miroClient) {
                await miroClient.request({
                  method: "tools/call",
                  params: {
                    name: "create_sticky_note",
                    arguments: stickyNoteArgs
                  }
                });
              }
            }
            currentX += itemSpacing;
          }
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Miro board created successfully using ${isRemote ? 'remote' : 'local'} MCP server!`,
          },
          {
            type: "text",
            text: `Board ID: ${boardId}`,
          },
          {
            type: "text",
            text: `Board Name: ${boardName}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to create Miro board: ${error instanceof Error ? error.message : String(error)}`);
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