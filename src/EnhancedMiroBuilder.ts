import { Client } from "@modelcontextprotocol/sdk/client/index.js";

interface MiroPosition {
  x: number;
  y: number;
}

interface MiroColor {
  background: string;
  text?: string;
}

interface MiroSection {
  title: string;
  type: string;
  content?: string;
  color?: string;
  items?: string[];
  language?: string;
  beforeCode?: string;
  afterCode?: string;
}

interface SessionContent {
  topic: string;
  sessionOverview: string;
  learningObjectives: string[];
  activities: any[];
  discussionPrompts: string[];
  keyTakeaways: string[];
  miroContent: {
    boardTitle: string;
    style?: string;
    sections: MiroSection[];
  };
}

export class EnhancedMiroBuilder {
  private readonly miroClient: Client;
  private readonly colors = {
    connect: { background: '#FFE5B4', text: '#4A4A4A' },      // Warm peach
    concept: { background: '#B4D4FF', text: '#1E3A5F' },      // Soft blue
    concrete: { background: '#B4FFB4', text: '#2E5F2E' },     // Soft green
    conclusion: { background: '#FFB4D4', text: '#5F1E3A' },   // Soft pink
    header: { background: '#1E3A5F', text: '#FFFFFF' },       // Deep blue
    facilitator: { background: '#F5F5DC', text: '#333333' },  // Beige
    resources: { background: '#E8E8E8', text: '#333333' }     // Light gray
  };

  private readonly stickyColors = {
    yellow: 'light_yellow',
    blue: 'light_blue',
    green: 'light_green',
    pink: 'light_pink',
    orange: 'orange',
    purple: 'light_purple',
    gray: 'gray'
  };

  constructor(miroClient: Client) {
    this.miroClient = miroClient;
  }

  async createEnhancedBoard(sessionContent: SessionContent): Promise<string> {
    try {
      // Create the board
      const boardResult = await this.miroClient.callTool({
        name: "create_board",
        arguments: {
          name: sessionContent.miroContent.boardTitle,
          description: `Learning Hour: ${sessionContent.topic}\n\n${sessionContent.sessionOverview}`
        }
      });

      const boardId = this.extractBoardId(boardResult);
      if (!boardId) {
        throw new Error('Failed to create board');
      }

      // Build the board layout
      await this.buildBoardLayout(boardId, sessionContent);

      return boardId;
    } catch (error) {
      throw new Error(`Failed to create enhanced Miro board: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async buildBoardLayout(boardId: string, sessionContent: SessionContent) {
    const style = sessionContent.miroContent.style || 'slide';
    
    // Layout constants
    const FRAME_WIDTH = 2400;
    const FRAME_HEIGHT = 1200;
    const FRAME_SPACING = 200;
    const SECTION_SPACING = 400;
    
    let currentPosition: MiroPosition = { x: 0, y: 0 };

    // 1. Create Header Frame
    await this.createHeaderFrame(boardId, sessionContent, currentPosition);
    currentPosition.y += 600;

    // 2. Create Navigation Sidebar (for non-vertical styles)
    if (style !== 'vertical') {
      await this.createNavigationSidebar(boardId, { x: -500, y: currentPosition.y });
    }

    // 3. Create 4C Sections
    await this.createConnectSection(boardId, sessionContent, currentPosition);
    currentPosition = this.getNextPosition(currentPosition, style, FRAME_WIDTH, FRAME_HEIGHT, SECTION_SPACING);

    await this.createConceptSection(boardId, sessionContent, currentPosition);
    currentPosition = this.getNextPosition(currentPosition, style, FRAME_WIDTH, FRAME_HEIGHT, SECTION_SPACING);

    await this.createConcreteSection(boardId, sessionContent, currentPosition);
    currentPosition = this.getNextPosition(currentPosition, style, FRAME_WIDTH + 1200, FRAME_HEIGHT + 800, SECTION_SPACING);

    await this.createConclusionSection(boardId, sessionContent, currentPosition);
    currentPosition = this.getNextPosition(currentPosition, style, FRAME_WIDTH, FRAME_HEIGHT, SECTION_SPACING);

    // 4. Create Resources Section
    await this.createResourcesSection(boardId, sessionContent, currentPosition);

    // 5. Add Facilitator Notes
    if (style === 'workshop') {
      await this.createFacilitatorDashboard(boardId, { x: FRAME_WIDTH + SECTION_SPACING, y: 600 });
    }
  }

  private async createHeaderFrame(boardId: string, sessionContent: SessionContent, position: MiroPosition) {
    // Create main title
    await this.miroClient.callTool({
      name: "create_text",
      arguments: {
        boardId,
        text: `🎯 Learning Hour: ${sessionContent.topic}`,
        xPosition: position.x + 1200,
        yPosition: position.y,
        fontSize: 72,
        fontFamily: "Arial",
        textAlign: "center"
      }
    });

    // Create subtitle
    await this.miroClient.callTool({
      name: "create_text",
      arguments: {
        boardId,
        text: "Technical Excellence Through Deliberate Practice",
        xPosition: position.x + 1200,
        yPosition: position.y + 100,
        fontSize: 36,
        fontFamily: "Arial",
        textAlign: "center"
      }
    });

    // Create session overview
    await this.miroClient.callTool({
      name: "create_shape",
      arguments: {
        boardId,
        shapeType: "rectangle",
        xPosition: position.x + 1200,
        yPosition: position.y + 250,
        width: 2000,
        height: 150,
        fillColor: this.colors.header.background,
        text: sessionContent.sessionOverview,
        fontSize: 24,
        fontColor: this.colors.header.text
      }
    });
  }

  private async createNavigationSidebar(boardId: string, position: MiroPosition) {
    const navItems = [
      { phase: "1. CONNECT", time: "8 min", color: this.colors.connect },
      { phase: "2. CONCEPT", time: "15 min", color: this.colors.concept },
      { phase: "3. CONCRETE", time: "25 min", color: this.colors.concrete },
      { phase: "4. CONCLUSION", time: "7 min", color: this.colors.conclusion }
    ];

    let yOffset = 0;
    for (const item of navItems) {
      await this.miroClient.callTool({
        name: "create_shape",
        arguments: {
          boardId,
          shapeType: "rounded_rectangle",
          xPosition: position.x,
          yPosition: position.y + yOffset,
          width: 350,
          height: 120,
          fillColor: item.color.background,
          text: `${item.phase}\n⏱️ ${item.time}`,
          fontSize: 20,
          fontColor: item.color.text
        }
      });
      yOffset += 150;
    }
  }

  private async createConnectSection(boardId: string, sessionContent: SessionContent, position: MiroPosition) {
    // Section title
    await this.createSectionTitle(boardId, "🤝 CONNECT: Activating Prior Knowledge", position, this.colors.connect);

    // Timer
    await this.createTimer(boardId, "8 minutes", { x: position.x + 2200, y: position.y });

    // Instructions
    const instructions = [
      "👥 Find a pair from a different team",
      "💭 Share YOUR experience with this topic",
      "🔍 What patterns do you notice?",
      "📝 Prepare one insight to share"
    ];

    let xOffset = 100;
    for (const instruction of instructions) {
      await this.miroClient.callTool({
        name: "create_sticky_note",
        arguments: {
          boardId,
          text: instruction,
          xPosition: position.x + xOffset,
          yPosition: position.y + 200,
          color: this.stickyColors.yellow
        }
      });
      xOffset += 300;
    }

    // Participant workspace
    await this.createParticipantWorkspace(
      boardId, 
      "Add your experiences here →",
      { x: position.x + 100, y: position.y + 400 },
      8,
      this.stickyColors.yellow
    );
  }

  private async createConceptSection(boardId: string, sessionContent: SessionContent, position: MiroPosition) {
    // Section title
    await this.createSectionTitle(boardId, "🧠 CONCEPT: Understanding the Topic", position, this.colors.concept);

    // Timer
    await this.createTimer(boardId, "15 minutes", { x: position.x + 2200, y: position.y });

    // Live coding demo area
    await this.createCodeDemoArea(boardId, sessionContent, { x: position.x + 100, y: position.y + 200 });

    // Key concepts mind map
    await this.createConceptsArea(boardId, sessionContent, { x: position.x + 1400, y: position.y + 200 });

    // Questions parking lot
    await this.createQuestionsArea(boardId, { x: position.x + 100, y: position.y + 800 });
  }

  private async createConcreteSection(boardId: string, sessionContent: SessionContent, position: MiroPosition) {
    // Section title
    await this.createSectionTitle(boardId, "💻 CONCRETE: Hands-on Practice", position, this.colors.concrete);

    // Timer with intervals
    await this.createTimer(boardId, "25 minutes", { x: position.x + 3400, y: position.y });

    // Exercise instructions
    const steps = [
      "1️⃣ Write characterization test (5 min)",
      "2️⃣ Identify code smells (5 min)",
      "3️⃣ Apply refactoring (10 min)",
      "4️⃣ Run tests & iterate (5 min)"
    ];

    let yOffset = 200;
    for (const step of steps) {
      await this.miroClient.callTool({
        name: "create_shape",
        arguments: {
          boardId,
          shapeType: "rectangle",
          xPosition: position.x + 200,
          yPosition: position.y + yOffset,
          width: 600,
          height: 80,
          fillColor: this.colors.concrete.background,
          text: step,
          fontSize: 18
        }
      });
      yOffset += 100;
    }

    // Pair programming workspaces
    await this.createPairWorkspaces(boardId, { x: position.x + 1000, y: position.y + 200 });

    // Code exercise area
    if (sessionContent.miroContent.sections.find(s => s.type === 'code_examples')) {
      await this.createCodeExerciseArea(boardId, sessionContent, { x: position.x + 100, y: position.y + 700 });
    }
  }

  private async createConclusionSection(boardId: string, sessionContent: SessionContent, position: MiroPosition) {
    // Section title
    await this.createSectionTitle(boardId, "🎯 CONCLUSION: Commitment to Practice", position, this.colors.conclusion);

    // Timer
    await this.createTimer(boardId, "7 minutes", { x: position.x + 2200, y: position.y });

    // Reflection prompts
    const reflectionPrompts = [
      "💡 My biggest 'aha' moment was...",
      "🎯 In my current work, I will apply this to...",
      "📅 This week I commit to..."
    ];

    let xOffset = 100;
    for (const prompt of reflectionPrompts) {
      await this.miroClient.callTool({
        name: "create_shape",
        arguments: {
          boardId,
          shapeType: "rounded_rectangle",
          xPosition: position.x + xOffset,
          yPosition: position.y + 200,
          width: 600,
          height: 150,
          fillColor: this.colors.conclusion.background,
          text: prompt,
          fontSize: 20,
          fontColor: this.colors.conclusion.text
        }
      });
      xOffset += 700;
    }

    // Commitment wall
    await this.createCommitmentWall(boardId, { x: position.x + 100, y: position.y + 450 });
  }

  private async createResourcesSection(boardId: string, sessionContent: SessionContent, position: MiroPosition) {
    // Section title
    await this.createSectionTitle(boardId, "📚 Resources & Next Steps", position, this.colors.resources);

    // Key takeaways
    let xOffset = 100;
    for (const takeaway of sessionContent.keyTakeaways) {
      await this.miroClient.callTool({
        name: "create_sticky_note",
        arguments: {
          boardId,
          text: `✅ ${takeaway}`,
          xPosition: position.x + xOffset,
          yPosition: position.y + 200,
          color: this.stickyColors.purple
        }
      });
      xOffset += 300;
      if (xOffset > 1300) {
        xOffset = 100;
        position.y += 150;
      }
    }

    // Next steps
    const nextSteps = [
      "📅 Schedule follow-up mob session",
      "🔄 Share learnings in team retro",
      "📝 Apply technique in current sprint",
      "🎯 Track improvements in team metrics"
    ];

    position.y += 200;
    xOffset = 100;
    for (const step of nextSteps) {
      await this.miroClient.callTool({
        name: "create_sticky_note",
        arguments: {
          boardId,
          text: step,
          xPosition: position.x + xOffset,
          yPosition: position.y + 400,
          color: this.stickyColors.green
        }
      });
      xOffset += 300;
    }
  }

  private async createFacilitatorDashboard(boardId: string, position: MiroPosition) {
    // Create facilitator frame
    await this.miroClient.callTool({
      name: "create_shape",
      arguments: {
        boardId,
        shapeType: "rectangle",
        xPosition: position.x,
        yPosition: position.y,
        width: 800,
        height: 1500,
        fillColor: this.colors.facilitator.background,
        text: "🎯 FACILITATOR DASHBOARD",
        fontSize: 28,
        fontColor: this.colors.facilitator.text
      }
    });

    // Facilitation checklist
    const checklist = [
      "☐ Energy check at start",
      "☐ Pairs formed effectively",
      "☐ Clear instructions given",
      "☐ Time boxes respected",
      "☐ Questions addressed",
      "☐ Rotation reminders",
      "☐ Energy maintained",
      "☐ Commitments captured"
    ];

    let yOffset = 150;
    for (const item of checklist) {
      await this.miroClient.callTool({
        name: "create_text",
        arguments: {
          boardId,
          text: item,
          xPosition: position.x - 300,
          yPosition: position.y + yOffset,
          fontSize: 18
        }
      });
      yOffset += 50;
    }

    // Common challenges section
    await this.miroClient.callTool({
      name: "create_text",
      arguments: {
        boardId,
        text: "⚠️ Common Challenges:",
        xPosition: position.x - 300,
        yPosition: position.y + 600,
        fontSize: 20
      }
    });

    const challenges = [
      "• Pairs trying to do too much",
      "• Getting stuck on naming",
      "• Skipping tests",
      "• Not rotating roles"
    ];

    yOffset = 650;
    for (const challenge of challenges) {
      await this.miroClient.callTool({
        name: "create_text",
        arguments: {
          boardId,
          text: challenge,
          xPosition: position.x - 300,
          yPosition: position.y + yOffset,
          fontSize: 16
        }
      });
      yOffset += 40;
    }
  }

  // Helper methods

  private async createSectionTitle(boardId: string, title: string, position: MiroPosition, color: MiroColor) {
    await this.miroClient.callTool({
      name: "create_shape",
      arguments: {
        boardId,
        shapeType: "rectangle",
        xPosition: position.x + 1200,
        yPosition: position.y,
        width: 2400,
        height: 120,
        fillColor: color.background,
        text: title,
        fontSize: 36,
        fontColor: color.text
      }
    });
  }

  private async createTimer(boardId: string, duration: string, position: MiroPosition) {
    await this.miroClient.callTool({
      name: "create_shape",
      arguments: {
        boardId,
        shapeType: "circle",
        xPosition: position.x,
        yPosition: position.y,
        width: 150,
        height: 150,
        fillColor: "#FF6B6B",
        text: `⏱️\n${duration}`,
        fontSize: 20,
        fontColor: "#FFFFFF"
      }
    });
  }

  private async createParticipantWorkspace(
    boardId: string, 
    instruction: string, 
    position: MiroPosition, 
    stickyCount: number,
    color: string
  ) {
    // Instruction text
    await this.miroClient.callTool({
      name: "create_text",
      arguments: {
        boardId,
        text: instruction,
        xPosition: position.x,
        yPosition: position.y,
        fontSize: 24,
        fontStyle: "italic"
      }
    });

    // Create empty sticky notes for participants
    let xOffset = 0;
    let yOffset = 100;
    for (let i = 0; i < stickyCount; i++) {
      await this.miroClient.callTool({
        name: "create_sticky_note",
        arguments: {
          boardId,
          text: "",
          xPosition: position.x + xOffset,
          yPosition: position.y + yOffset,
          color
        }
      });
      xOffset += 250;
      if (xOffset > 1000) {
        xOffset = 0;
        yOffset += 200;
      }
    }
  }

  private async createCodeDemoArea(boardId: string, sessionContent: SessionContent, position: MiroPosition) {
    // Find code examples in sections
    const codeSection = sessionContent.miroContent.sections.find(s => s.type === 'code_examples');
    
    if (codeSection && codeSection.beforeCode) {
      // Before code
      await this.miroClient.callTool({
        name: "create_shape",
        arguments: {
          boardId,
          shapeType: "rectangle",
          xPosition: position.x,
          yPosition: position.y,
          width: 600,
          height: 400,
          fillColor: "#2D2D2D",
          text: `BEFORE:\n${codeSection.beforeCode}`,
          fontSize: 14,
          fontColor: "#FFFFFF",
          fontFamily: "Courier New"
        }
      });

      // Arrow
      await this.miroClient.callTool({
        name: "create_shape",
        arguments: {
          boardId,
          shapeType: "arrow",
          xPosition: position.x + 650,
          yPosition: position.y + 200,
          width: 100,
          height: 0,
          fillColor: "#4CAF50"
        }
      });

      // After code
      if (codeSection.afterCode) {
        await this.miroClient.callTool({
          name: "create_shape",
          arguments: {
            boardId,
            shapeType: "rectangle",
            xPosition: position.x + 800,
            yPosition: position.y,
            width: 600,
            height: 400,
            fillColor: "#2D2D2D",
            text: `AFTER:\n${codeSection.afterCode}`,
            fontSize: 14,
            fontColor: "#FFFFFF",
            fontFamily: "Courier New"
          }
        });
      }
    }
  }

  private async createConceptsArea(boardId: string, sessionContent: SessionContent, position: MiroPosition) {
    // Central concept
    await this.miroClient.callTool({
      name: "create_shape",
      arguments: {
        boardId,
        shapeType: "circle",
        xPosition: position.x,
        yPosition: position.y + 200,
        width: 200,
        height: 200,
        fillColor: this.colors.concept.background,
        text: sessionContent.topic,
        fontSize: 20,
        fontColor: this.colors.concept.text
      }
    });

    // Related concepts
    const concepts = ["Code Smells", "Refactoring", "SOLID", "Testing"];
    const angles = [0, 90, 180, 270];
    const radius = 250;

    for (let i = 0; i < concepts.length; i++) {
      const angle = angles[i] * Math.PI / 180;
      const x = position.x + radius * Math.cos(angle);
      const y = position.y + 200 + radius * Math.sin(angle);

      await this.miroClient.callTool({
        name: "create_shape",
        arguments: {
          boardId,
          shapeType: "rounded_rectangle",
          xPosition: x,
          yPosition: y,
          width: 150,
          height: 80,
          fillColor: "#E3F2FD",
          text: concepts[i],
          fontSize: 16
        }
      });
    }
  }

  private async createQuestionsArea(boardId: string, position: MiroPosition) {
    await this.miroClient.callTool({
      name: "create_text",
      arguments: {
        boardId,
        text: "❓ Questions Parking Lot - Add your questions here:",
        xPosition: position.x,
        yPosition: position.y,
        fontSize: 24
      }
    });

    // Create empty sticky notes for questions
    for (let i = 0; i < 6; i++) {
      await this.miroClient.callTool({
        name: "create_sticky_note",
        arguments: {
          boardId,
          text: "",
          xPosition: position.x + (i % 3) * 250,
          yPosition: position.y + 100 + Math.floor(i / 3) * 150,
          color: this.stickyColors.orange
        }
      });
    }
  }

  private async createPairWorkspaces(boardId: string, position: MiroPosition) {
    const pairs = ["Pair 1", "Pair 2", "Pair 3", "Pair 4", "Pair 5", "Pair 6"];
    const colors = ["#E6F3FF", "#FFE6F3", "#F3FFE6", "#FFF3E6", "#F3E6FF", "#E6FFF3"];

    for (let i = 0; i < pairs.length; i++) {
      const x = position.x + (i % 3) * 800;
      const y = position.y + Math.floor(i / 3) * 600;

      // Create workspace frame
      await this.miroClient.callTool({
        name: "create_shape",
        arguments: {
          boardId,
          shapeType: "rectangle",
          xPosition: x,
          yPosition: y,
          width: 700,
          height: 500,
          fillColor: colors[i],
          text: pairs[i],
          fontSize: 24
        }
      });

      // Add workspace elements
      await this.miroClient.callTool({
        name: "create_text",
        arguments: {
          boardId,
          text: "💻 Code here",
          xPosition: x - 250,
          yPosition: y - 150,
          fontSize: 18
        }
      });

      await this.miroClient.callTool({
        name: "create_text",
        arguments: {
          boardId,
          text: "📝 Notes",
          xPosition: x - 250,
          yPosition: y + 50,
          fontSize: 18
        }
      });
    }
  }

  private async createCodeExerciseArea(boardId: string, sessionContent: SessionContent, position: MiroPosition) {
    // Find code exercise sections
    const exerciseSections = sessionContent.miroContent.sections.filter(s => 
      s.type === 'code_examples' && s.title?.includes('Refactoring Step')
    );

    let xOffset = 0;
    for (const section of exerciseSections) {
      await this.miroClient.callTool({
        name: "create_shape",
        arguments: {
          boardId,
          shapeType: "rectangle",
          xPosition: position.x + xOffset,
          yPosition: position.y,
          width: 800,
          height: 600,
          fillColor: "#F5F5F5",
          text: section.title || "Code Exercise",
          fontSize: 20
        }
      });

      if (section.content) {
        await this.miroClient.callTool({
          name: "create_text",
          arguments: {
            boardId,
            text: section.content,
            xPosition: position.x + xOffset - 350,
            yPosition: position.y + 100,
            fontSize: 16,
            width: 700
          }
        });
      }

      xOffset += 900;
    }
  }

  private async createCommitmentWall(boardId: string, position: MiroPosition) {
    await this.miroClient.callTool({
      name: "create_text",
      arguments: {
        boardId,
        text: "🎯 COMMITMENT WALL - Add your commitment here:",
        xPosition: position.x + 1000,
        yPosition: position.y,
        fontSize: 28
      }
    });

    // Create a grid of empty sticky notes
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        await this.miroClient.callTool({
          name: "create_sticky_note",
          arguments: {
            boardId,
            text: "",
            xPosition: position.x + col * 250,
            yPosition: position.y + 100 + row * 150,
            color: this.stickyColors.pink
          }
        });
      }
    }
  }

  private getNextPosition(
    current: MiroPosition, 
    style: string, 
    width: number, 
    height: number, 
    spacing: number
  ): MiroPosition {
    switch (style) {
      case 'vertical':
        return { x: current.x, y: current.y + height + spacing };
      case 'workshop':
        return { x: current.x + width + spacing, y: current.y };
      default: // slide
        return { x: current.x, y: current.y + height + spacing };
    }
  }

  private extractBoardId(boardResult: any): string | null {
    try {
      const content = boardResult?.content?.[0]?.text;
      const match = content?.match(/Board ID: ([\w-]+)/);
      return match?.[1] || null;
    } catch {
      return null;
    }
  }
}