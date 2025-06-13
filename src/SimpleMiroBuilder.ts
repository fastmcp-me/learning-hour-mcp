import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SessionContent } from './LearningHourGenerator.js';

interface MiroPosition {
  x: number;
  y: number;
}

export class SimpleMiroBuilder {
  private miroClient: Client;

  constructor(miroClient: Client) {
    this.miroClient = miroClient;
  }

  async createSimpleBoard(sessionContent: SessionContent): Promise<string> {
    console.error('SimpleMiroBuilder.createSimpleBoard called');
    
    try {
      // Create the board
      console.error('Creating board:', sessionContent.miroContent.boardTitle);
      
      const boardResult = await this.miroClient.callTool({
        name: "create-board",
        arguments: {
          name: sessionContent.miroContent.boardTitle,
          description: `Learning Hour: ${sessionContent.topic}\n\n${sessionContent.sessionOverview}`
        }
      });
      
      console.error('Board creation result:', JSON.stringify(boardResult, null, 2));

      const boardId = this.extractBoardId(boardResult);
      console.error('Extracted board ID:', boardId);
      
      if (!boardId) {
        throw new Error('Failed to create board - no board ID extracted');
      }

      // Create frames for each section
      await this.createFrames(boardId, sessionContent);

      return boardId;
    } catch (error) {
      console.error('Error in createSimpleBoard:', error);
      throw new Error(`Failed to create Miro board: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async createFrames(boardId: string, sessionContent: SessionContent) {
    console.error('Creating frames for board:', boardId);
    
    let yPosition = 0;
    const frameSpacing = 1000;

    // Create header frame
    await this.createFrame(boardId, "🎯 Learning Hour Overview", 0, yPosition, 2400, 400, {
      content: `Topic: ${sessionContent.topic}\n${sessionContent.sessionOverview}`
    });
    yPosition += frameSpacing;

    // Create Connect frame
    const connectActivity = sessionContent.activities.find(a => a.title.includes('Connect'));
    if (connectActivity) {
      await this.createFrame(boardId, "🤝 CONNECT (10 min)", 0, yPosition, 2400, 600, {
        content: connectActivity.description + '\n\n' + connectActivity.instructions.join('\n')
      });
      yPosition += frameSpacing;
    }

    // Create Concept frame
    const conceptActivity = sessionContent.activities.find(a => a.title.includes('Concept'));
    if (conceptActivity) {
      await this.createFrame(boardId, "💡 CONCEPT (10 min)", 0, yPosition, 2400, 600, {
        content: conceptActivity.description + '\n\nLearning Objectives:\n' + sessionContent.learningObjectives.join('\n')
      });
      yPosition += frameSpacing;
    }

    // Create Concrete frame
    const concreteActivity = sessionContent.activities.find(a => a.title.includes('Concrete'));
    if (concreteActivity) {
      await this.createFrame(boardId, "🔨 CONCRETE (30 min)", 0, yPosition, 2400, 800, {
        content: concreteActivity.description + '\n\n' + concreteActivity.instructions.join('\n')
      });
      yPosition += frameSpacing;
    }

    // Create Conclusion frame
    const conclusionActivity = sessionContent.activities.find(a => a.title.includes('Conclusion'));
    if (conclusionActivity) {
      await this.createFrame(boardId, "✨ CONCLUSION (10 min)", 0, yPosition, 2400, 600, {
        content: conclusionActivity.description + '\n\nKey Takeaways:\n' + sessionContent.keyTakeaways.join('\n')
      });
    }
  }

  private async createFrame(
    boardId: string, 
    title: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number,
    options: { content?: string } = {}
  ) {
    try {
      console.error(`Creating frame: ${title}`);
      
      const frameResult = await this.miroClient.callTool({
        name: "create-frame",
        arguments: {
          boardId,
          title,
          x,
          y,
          width,
          height
        }
      });
      
      console.error(`Frame created: ${title}`, frameResult);
      
      // If we have content, we might need to add it as a text item or description
      // This depends on what the Miro MCP supports
      
      return frameResult;
    } catch (error) {
      console.error(`Error creating frame ${title}:`, error);
      throw error;
    }
  }

  private extractBoardId(boardResult: any): string | null {
    console.error('extractBoardId called with:', JSON.stringify(boardResult, null, 2));
    
    try {
      const content = boardResult?.content?.[0]?.text;
      console.error('Extracted content text:', content);
      
      if (!content) {
        console.error('No content text found in result');
        return null;
      }
      
      // Try different patterns
      let match = content.match(/Board ID: ([\w-]+)/);
      if (!match) {
        match = content.match(/board[/_]?id[\"']?\s*[:=]\s*[\"']?([\w-]+)/i);
      }
      if (!match) {
        match = content.match(/id[\"']?\s*[:=]\s*[\"']?([\w-]+)/i);
      }
      if (!match) {
        // Try to find a URL pattern
        match = content.match(/board\/([\w-]+)/);
      }
      
      console.error('Regex match result:', match);
      
      return match?.[1] || null;
    } catch (error) {
      console.error('Error in extractBoardId:', error);
      return null;
    }
  }
}