#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from "axios";

const GenerateSessionInputSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
});

const GenerateCodeExampleInputSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  language: z.string().optional().default("javascript"),
});

class LearningHourMCP {
  private server: Server;

  constructor() {
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
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case "generate_session":
            return await this.generateSession(request.params.arguments);
          case "generate_code_example":
            return await this.generateCodeExample(request.params.arguments);
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
    
    const prompt = `Create a comprehensive Learning Hour session for Technical Coaches on the topic: "${input.topic}".

Please provide:
1. A session overview (2-3 sentences explaining what participants will learn)
2. Learning objectives (3-4 specific outcomes)
3. Step-by-step activities (4-6 hands-on exercises)
4. Discussion prompts for group reflection (4-5 thoughtful questions)
5. Key takeaways (3-4 main points to remember)
6. Miro board structure with sticky note content

Format your response as JSON with this exact structure:
{
  "topic": "${input.topic}",
  "sessionOverview": "Brief description of what participants will learn and why it matters",
  "learningObjectives": [
    "Participants will be able to...",
    "Participants will understand...",
    "Participants will practice..."
  ],
  "activities": [
    {
      "title": "Activity 1: Identify the Problem",
      "duration": "10 minutes",
      "description": "Detailed description of the activity",
      "instructions": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "discussionPrompts": [
    "What challenges have you faced with this concept?",
    "How might this improve your code quality?",
    "When would you not apply this principle?"
  ],
  "keyTakeaways": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ],
  "miroContent": {
    "boardTitle": "Learning Hour: ${input.topic}",
    "sections": [
      {
        "title": "Session Overview",
        "type": "text_frame",
        "content": "overview content here"
      },
      {
        "title": "Learning Objectives",
        "type": "sticky_notes",
        "color": "light_blue",
        "items": ["objective 1", "objective 2", "objective 3"]
      },
      {
        "title": "Activities",
        "type": "sticky_notes", 
        "color": "light_green",
        "items": ["activity 1", "activity 2", "activity 3"]
      },
      {
        "title": "Discussion Questions",
        "type": "sticky_notes",
        "color": "light_yellow",
        "items": ["question 1", "question 2", "question 3"]
      },
      {
        "title": "Key Takeaways",
        "type": "sticky_notes",
        "color": "light_pink",
        "items": ["takeaway 1", "takeaway 2", "takeaway 3"]
      }
    ]
  }
}`;

    try {
      if (process.env.ANTHROPIC_API_KEY) {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        }, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          }
        });

        const content = response.data.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          throw new Error('No valid JSON found in AI response');
        }

        const sessionData = JSON.parse(jsonMatch[0]);

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
      } else {
        const mockSessionData = {
          topic: input.topic,
          sessionOverview: `Learn to identify and refactor ${input.topic} through hands-on exercises and group discussion.`,
          learningObjectives: [
            `Participants will be able to identify ${input.topic} in code`,
            `Participants will understand why ${input.topic} is problematic`,
            `Participants will practice refactoring techniques`,
            `Participants will discuss prevention strategies`
          ],
          activities: [
            {
              title: "Code Review Exercise",
              duration: "15 minutes", 
              description: `Review code examples and identify instances of ${input.topic}`,
              instructions: ["Split into pairs", "Review provided code snippets", "Mark problematic areas", "Discuss findings with group"]
            },
            {
              title: "Refactoring Practice",
              duration: "20 minutes",
              description: `Practice refactoring code to eliminate ${input.topic}`,
              instructions: ["Choose one code example", "Brainstorm refactoring approaches", "Implement the refactoring", "Compare before and after"]
            }
          ],
          discussionPrompts: [
            `What makes ${input.topic} problematic for code maintenance?`,
            `How does ${input.topic} affect team collaboration?`,
            `What patterns can help prevent ${input.topic}?`,
            `When might ${input.topic} be acceptable?`
          ],
          keyTakeaways: [
            `${input.topic} reduces code readability and maintainability`,
            `Refactoring ${input.topic} improves code organization`,
            `Prevention is better than cure - design to avoid ${input.topic}`
          ],
          miroContent: {
            boardTitle: `Learning Hour: ${input.topic}`,
            sections: [
              {
                title: "Session Overview",
                type: "text_frame",
                content: `Learn to identify and refactor ${input.topic} through hands-on exercises and group discussion.`
              },
              {
                title: "Learning Objectives", 
                type: "sticky_notes",
                color: "light_blue",
                items: [
                  `Identify ${input.topic} in code`,
                  `Understand why it's problematic`, 
                  `Practice refactoring techniques`,
                  `Discuss prevention strategies`
                ]
              },
              {
                title: "Activities",
                type: "sticky_notes",
                color: "light_green", 
                items: [
                  "Code Review Exercise (15 min)",
                  "Refactoring Practice (20 min)",
                  "Group Discussion (10 min)"
                ]
              },
              {
                title: "Discussion Questions",
                type: "sticky_notes",
                color: "light_yellow",
                items: [
                  `What makes ${input.topic} problematic?`,
                  "How does it affect team collaboration?",
                  "What patterns help prevent it?",
                  "When might it be acceptable?"
                ]
              },
              {
                title: "Key Takeaways",
                type: "sticky_notes", 
                color: "light_pink",
                items: [
                  `${input.topic} reduces maintainability`,
                  "Refactoring improves organization",
                  "Prevention > cure"
                ]
              }
            ]
          }
        };

        return {
          content: [
            {
              type: "text",
              text: `✅ Mock Learning Hour session generated for: ${input.topic}`,
            },
            {
              type: "text",
              text: JSON.stringify(mockSessionData, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(`Failed to generate session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async generateCodeExample(args: any) {
    const input = GenerateCodeExampleInputSchema.parse(args);

    const prompt = `Create detailed before/after code examples for the topic "${input.topic}" in ${input.language}.

Please provide:
1. A "before" code example that clearly demonstrates the problem
2. An "after" code example showing the refactored solution
3. Explanation of what was wrong
4. Explanation of how the refactoring helps
5. Additional refactoring opportunities

Format as JSON:
{
  "topic": "${input.topic}",
  "language": "${input.language}",
  "beforeCode": "// Code that demonstrates the problem",
  "afterCode": "// Refactored code that solves the problem", 
  "problemExplanation": "What was wrong with the original code",
  "solutionExplanation": "How the refactoring improves the code",
  "additionalOpportunities": ["Other improvements that could be made"]
}`;

    try {
      if (process.env.ANTHROPIC_API_KEY) {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        }, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          }
        });

        const content = response.data.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          throw new Error('No valid JSON found in AI response');
        }

        const exampleData = JSON.parse(jsonMatch[0]);

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
      } else {
        const mockExampleData = {
          topic: input.topic,
          language: input.language,
          beforeCode: `// Example showing ${input.topic}\nclass OrderProcessor {\n    process(order) {\n        // Problem code here\n        return order.total * 1.1;\n    }\n}`,
          afterCode: `// Refactored solution\nclass OrderProcessor {\n    process(order) {\n        return this.calculateTotalWithTax(order);\n    }\n    \n    calculateTotalWithTax(order) {\n        const TAX_RATE = 0.1;\n        return order.total * (1 + TAX_RATE);\n    }\n}`,
          problemExplanation: `The original code demonstrates ${input.topic} by having unclear logic mixed with calculations`,
          solutionExplanation: `The refactored version separates concerns and makes the intent clearer`,
          additionalOpportunities: [
            "Extract tax rate to configuration",
            "Add input validation",
            "Consider using a tax calculation service"
          ]
        };

        return {
          content: [
            {
              type: "text", 
              text: `✅ Mock code examples generated for: ${input.topic} (${input.language})`,
            },
            {
              type: "text",
              text: JSON.stringify(mockExampleData, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(`Failed to generate code example: ${error instanceof Error ? error.message : String(error)}`);
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