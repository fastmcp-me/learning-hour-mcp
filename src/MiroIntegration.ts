import axios from 'axios';
import FormData from 'form-data';
import { CodeImageGenerator } from './CodeImageGenerator.js';

interface MiroBoard {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  modifiedAt: string;
  viewLink: string;
}

interface MiroStickyNote {
  id: string;
  type: 'sticky_note';
  data: {
    content: string;
    shape: 'square' | 'rectangle';
  };
  style: {
    fillColor: string;
  };
  position: {
    x: number;
    y: number;
  };
}

interface MiroFrame {
  id: string;
  type: 'text';
  data: {
    content: string;
  };
  position: {
    x: number;
    y: number;
  };
  geometry: {
    width: number;
    height: number;
  };
}

interface MiroSection {
  type: 'text_frame' | 'code_block' | 'code_examples' | 'sticky_notes';
  title: string;
  content?: string;
  code?: string;
  beforeCode?: string;
  afterCode?: string;
  language?: string;
  items?: string[];
  color?: string;
}

interface SessionContent {
  sessionOverview: string;
  miroContent: {
    boardTitle: string;
    style?: 'slide' | 'vertical';
    sections: MiroSection[];
  };
}

interface LearningHourMiroLayout {
  boardId: string;
  viewLink?: string;
  sections: {
    overview: MiroFrame;
    objectives: MiroStickyNote[];
    activities: MiroStickyNote[];
    discussions: MiroStickyNote[];
    takeaways: MiroStickyNote[];
  };
}

type Theme = "breeze" | "candy" | "crimson" | "falcon" | "meadow" | "midnight" | "raindrop" | "sunset";

export class MiroIntegration {
  private readonly miroApiUrl = 'https://api.miro.com/v2';
  private readonly accessToken: string;
  private codeImageGenerator: CodeImageGenerator;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.codeImageGenerator = new CodeImageGenerator();
  }

  async listBoards(limit: number = 50, cursor?: string): Promise<{ data: MiroBoard[], cursor?: string }> {
    try {
      const params: any = { limit };
      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axios.get(`${this.miroApiUrl}/boards`, {
        headers: {
          'authorization': `Bearer ${this.accessToken}`,
        },
        params
      });

      return {
        data: response.data.data || [],
        cursor: response.data.cursor
      };
    } catch (error: any) {
      throw new Error(`Failed to list boards: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBoardInfo(boardId: string): Promise<MiroBoard> {
    try {
      const response = await axios.get(`${this.miroApiUrl}/boards/${boardId}`, {
        headers: {
          'authorization': `Bearer ${this.accessToken}`,
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get board info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createFrame(boardId: string, x: number, y: number, width: number = 400, height: number = 200): Promise<MiroFrame> {
    try {
      const response = await axios.post(`${this.miroApiUrl}/boards/${boardId}/frames`, {
        data: {},
        style: {
          fillColor: '#ffffff'
        },
        position: {
          x: x,
          y: y
        },
        geometry: {
          width: width,
          height: height
        }
      }, {
        headers: {
          'authorization': `Bearer ${this.accessToken}`,
          'content-type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Text frame creation error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fields: error.response?.data?.context?.fields,
        validations: error.response?.data?.context.validationErrors,
        message: error.message
      });
      throw new Error(`Failed to create text frame: ${error.response?.data?.message || error.message}`);
    }
  }

  async createTextBox(boardId: string, content: string, x: number, y: number, width: number, fillColor: string = '#F7F7F7'): Promise<any> {
    try {
      const requestBody: any = {
        data: {
          content: content
        },
        style: {
          color: "#1a1a1a",
          fillColor: fillColor,
          fontFamily: "arial",
          textAlign: "left"
        },
        position: {
          x: x,
          y: y
        },
        geometry: {
          rotation: 0,
          width: width
        },
        parent: {
          id: parseInt(boardId)
        }
      };

      const response = await axios.post(`${this.miroApiUrl}/boards/${boardId}/texts`, requestBody, {
        headers: {
          'authorization': `Bearer ${this.accessToken}`,
          'content-type': 'application/json',
          'accept': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Textbox creation error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fields: error.response?.data?.context?.fields,
        message: error.message
      });

      throw new Error(`Failed to create textbox: ${error.response?.data?.message || error.message}`);
    }
  }

  async createStickyNote(boardId: string, content: string, x: number, y: number, color: string = 'light_yellow'): Promise<MiroStickyNote> {
    try {
      const response = await axios.post(`${this.miroApiUrl}/boards/${boardId}/sticky_notes`, {
        data: {
          content: content
        },
        style: {
          fillColor: color
        },
        position: {
          x: x,
          y: y
        }
      }, {
        headers: {
          'authorization': `Bearer ${this.accessToken}`,
          'content-type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Sticky note creation error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fields: error.response?.data?.context?.fields,
        message: error.message
      });
      throw new Error(`Failed to create sticky note: ${error.response?.data?.message || error.message}`);
    }
  }

  async createCodeBlock(boardId: string, code: string, x: number, y: number, language: string = 'javascript', width: number = 800, height: number = 400, title?: string, theme: Theme = 'sunset'): Promise<any> {
    try {
      const cleanCode = this.codeImageGenerator.cleanCodeSnippet(code);

      const codeImage = await this.codeImageGenerator.generateCodeImage({
        code: cleanCode,
        language: language,
        theme: theme,
        darkMode: true,
        padding: 32,
        title: title
      });

      if (codeImage && codeImage.buffer) {
        // Upload image using multipart form data
        const formData = new FormData();
        formData.append('resource', codeImage.buffer, {
          filename: `code-${Date.now()}.png`,
          contentType: 'image/png'
        });

        // Add position and geometry as form fields
        formData.append('data', JSON.stringify({
          position: {
            x: x,
            y: y
          },
          geometry: {
            width: width,
            height: height
          }
        }));

        const response = await axios.post(`${this.miroApiUrl}/boards/${boardId}/images`, formData, {
          headers: {
            'authorization': `Bearer ${this.accessToken}`,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });

        return response.data;
      } else {
        // Fallback to text-based approach
        console.log('Using text-based code block (no image buffer available)');
        return this.createTextBasedCodeBlock(boardId, cleanCode, x, y, width, height);
      }
    } catch (error: any) {
      console.error('Code block creation error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fields: error.response?.data?.context?.fields,
        message: error.message
      });
      throw new Error(`Failed to create code block: ${error.response?.data?.message || error.message}`);
    }
  }

  private async createTextBasedCodeBlock(boardId: string, code: string, x: number, y: number, width: number, height: number): Promise<any> {
    await axios.post(`${this.miroApiUrl}/boards/${boardId}/shapes`, {
      data: {
        content: code,
        shape: 'rectangle'
      },
      style: {
        fillColor: "#1e1e1e",
        borderWidth: 2
      },
      position: {
        x: x,
        y: y
      },
      geometry: {
        width: width,
        height: height
      }
    }, {
      headers: {
        'authorization': `Bearer ${this.accessToken}`,
        'content-type': 'application/json'
      }
    });

    const response = await axios.post(`${this.miroApiUrl}/boards/${boardId}/texts`, {
      data: {
        content: code
      },
      style: {
        color: "#d4d4d4",
        fillColor: "#ffffff",
        fontFamily: "arial",
        fontSize: 12,
        textAlign: "left"
      },
      position: {
        x: x + 20,
        y: y + 20
      },
      geometry: {
        width: width - 40
      }
    }, {
      headers: {
        'authorization': `Bearer ${this.accessToken}`,
        'content-type': 'application/json'
      }
    });

    return response.data;
  }

  async createLearningHourBoard(sessionContent: SessionContent): Promise<LearningHourMiroLayout> {
    const boardName = sessionContent.miroContent.boardTitle;
    const board = await this.createBoard(boardName, sessionContent.sessionOverview);
    const style = sessionContent.miroContent.style ?? 'slide';

    const layout: LearningHourMiroLayout = {
      boardId: board.id,
      viewLink: board.viewLink,
      sections: {
        overview: {} as MiroFrame,
        objectives: [],
        activities: [],
        discussions: [],
        takeaways: []
      }
    };

    if (style === 'slide') {
      return await this.createSlideLayout(board.id, sessionContent, layout);
    } else {
      return await this.createVerticalLayout(board.id, sessionContent, layout);
    }
  }

  private async createBoard(name: string, description?: string): Promise<MiroBoard> {
    try {
      const requestBody: any = { name };
      if (description) {
        requestBody.description = description;
      }

      const response = await axios.post(`${this.miroApiUrl}/boards`, requestBody, {
        headers: {
          'authorization': `Bearer ${this.accessToken}`,
          'content-type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        throw new Error(`Failed to create Miro board: ${status} - ${JSON.stringify(data)}`);
      }
      throw new Error(`Failed to create Miro board: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async addFramesToExistingBoard(boardId: string, sessionContent: SessionContent): Promise<LearningHourMiroLayout> {
    console.info('Session content structure:', {
      hasMiroContent: !!sessionContent.miroContent,
      miroContentKeys: sessionContent.miroContent ? Object.keys(sessionContent.miroContent) : [],
      hasSections: sessionContent.miroContent?.sections !== undefined,
      sectionsType: Array.isArray(sessionContent.miroContent?.sections) ? 'array' : typeof sessionContent.miroContent?.sections,
      sectionsLength: Array.isArray(sessionContent.miroContent?.sections) ? sessionContent.miroContent.sections.length : 'N/A'
    });

    const style = sessionContent.miroContent?.style ?? 'slide';

    // Get board info to find a good position for new content
    const boardInfo = await this.getBoardInfo(boardId);

    const layout: LearningHourMiroLayout = {
      boardId: boardId,
      viewLink: boardInfo.viewLink,
      sections: {
        overview: {} as MiroFrame,
        objectives: [],
        activities: [],
        discussions: [],
        takeaways: []
      }
    };

    // Add frames to the existing board
    if (style === 'slide') {
      return await this.createSlideLayout(boardId, sessionContent, layout);
    } else {
      return await this.createVerticalLayout(boardId, sessionContent, layout);
    }
  }

  private async createSlideLayout(boardId: string, content: SessionContent, layout: LearningHourMiroLayout): Promise<LearningHourMiroLayout> {
    const slideSpacing = 1000;
    let currentSlideX = 0;

    // Ensure sections exists and is iterable
    const sections = content.miroContent?.sections || [];
    if (!Array.isArray(sections)) {
      throw new Error('miroContent.sections must be an array');
    }

    for (const section of sections) {
      const slideX = currentSlideX;
      const slideY = 0;

      // Create title text box for this section
      await this.createTextBox(boardId, section.title, slideX - 50, slideY - 300, 800, '#ffffff');

      // Create frame for section title
      await this.createFrame(boardId, slideX, slideY - 250, 800, 800);

      if (section.type === 'text_frame') {
        const contentFrame = await this.createFrame(boardId, slideX, slideY - 100, 800, 800);

        if (section.title === 'Session Overview') {
          layout.sections.overview = contentFrame;
        }
      } else if (section.type === 'code_block' && section.code) {
        await this.createCodeBlock(
          boardId,
          section.code,
          slideX,
          slideY - 100,
          section.language || 'javascript',
          700,
          300
        );
      } else if (section.type === 'code_examples' && section.beforeCode && section.afterCode) {
        await this.createTextBox(boardId, 'Before', slideX - 350, slideY - 300, 100, '#FFE066');
        await this.createTextBox(boardId, 'After', slideX + 250, slideY - 300, 100, '#06D6A0');

        await this.createCodeBlock(boardId, section.beforeCode, slideX - 350, slideY - 50, section.language || 'javascript', 400, 350, 'Before', 'midnight');

        await this.createCodeBlock(boardId, section.afterCode, slideX + 250, slideY - 50, section.language || 'javascript', 400, 350, 'After', 'midnight');
      } else if (section.type === 'sticky_notes' && section.items) {
        const stickyNotes = await this.createStickyNotesGrid(
          boardId, section.items, slideX, slideY, section.color ?? 'light_yellow'
        );
        this.assignStickyNotesToSection(layout, section.title, stickyNotes);
      }

      currentSlideX += slideSpacing;
    }

    return layout;
  }

  private async createVerticalLayout(boardId: string, content: SessionContent, layout: LearningHourMiroLayout): Promise<LearningHourMiroLayout> {
    let currentY = -400;
    const sectionSpacing = 300;

    // Ensure sections exists and is iterable
    const sections = content.miroContent?.sections || [];
    if (!Array.isArray(sections)) {
      throw new Error('miroContent.sections must be an array');
    }

    for (const section of sections) {
      const sectionY = currentY;
      currentY += sectionSpacing;

      // Create title text box for vertical layout
      await this.createTextBox(boardId, section.title, -500, sectionY - 50, 200, '#ffffff');
      await this.createFrame(boardId, -500, sectionY, 800, 800);

      if (section.type === 'text_frame') {
        const textFrame = await this.createFrame(boardId, -200, sectionY, 800, 800);

        if (section.title === 'Session Overview') {
          layout.sections.overview = textFrame;
        }
        currentY += 200;
      } else if (section.type === 'code_block' && section.code) {
        await this.createCodeBlock(
          boardId,
          section.code,
          -200,
          sectionY,
          section.language || 'javascript',
          600,
          300
        );
        currentY += 350;
      } else if (section.type === 'code_examples' && section.beforeCode && section.afterCode) {
        await this.createTextBox(boardId, 'Before', -600, sectionY, 100, '#FFE066');
        await this.createTextBox(boardId, 'After', 100, sectionY, 100, '#06D6A0');

        await this.createCodeBlock(boardId, section.beforeCode, -600, sectionY + 50, section.language || 'javascript', 400, 350, 'Before', 'midnight');

        await this.createCodeBlock(boardId, section.afterCode, 100, sectionY + 50, section.language || 'javascript', 400, 350, 'After', 'midnight');
        currentY += 450;
      } else if (section.type === 'sticky_notes' && section.items) {
        const stickyNotes: MiroStickyNote[] = [];
        let currentX = -400;

        for (const item of section.items) {
          const note = await this.createStickyNote(
            boardId,
            item,
            currentX,
            sectionY,
            section.color
          );
          stickyNotes.push(note);
          currentX += 120;
        }

        this.assignStickyNotesToSection(layout, section.title, stickyNotes);
      }
    }

    return layout;
  }

  private async createStickyNotesGrid(boardId: string, items: string[], centerX: number, centerY: number, color: string): Promise<MiroStickyNote[]> {
    const stickyNotes: MiroStickyNote[] = [];
    const itemsPerRow = Math.min(3, items.length);
    const rows = Math.ceil(items.length / itemsPerRow);
    const itemSpacingX = 200;
    const itemSpacingY = 140;

    const startX = centerX - ((itemsPerRow - 1) * itemSpacingX) / 2;
    const startY = centerY - ((rows - 1) * itemSpacingY) / 2;

    for (let i = 0; i < items.length; i++) {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const itemX = startX + (col * itemSpacingX);
      const itemY = startY + (row * itemSpacingY);

      const note = await this.createStickyNote(
        boardId,
        `• ${items[i]}`,
        itemX,
        itemY,
        color
      );
      stickyNotes.push(note);
    }

    return stickyNotes;
  }

  private assignStickyNotesToSection(layout: LearningHourMiroLayout, sectionTitle: string, stickyNotes: MiroStickyNote[]): void {
    switch (sectionTitle) {
      case 'Learning Objectives':
        layout.sections.objectives = stickyNotes;
        break;
      case 'Activities':
        layout.sections.activities = stickyNotes;
        break;
      case 'Discussion Questions':
        layout.sections.discussions = stickyNotes;
        break;
      case 'Key Takeaways':
        layout.sections.takeaways = stickyNotes;
        break;
    }
  }
}
