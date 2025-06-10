import axios from 'axios';

interface MiroBoard {
  id: string;
  name: string;
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

interface MiroTextFrame {
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

interface LearningHourMiroLayout {
  boardId: string;
  sections: {
    overview: MiroTextFrame;
    objectives: MiroStickyNote[];
    activities: MiroStickyNote[];
    discussions: MiroStickyNote[];
    takeaways: MiroStickyNote[];
  };
}

export class MiroIntegration {
  private readonly miroApiUrl = 'https://api.miro.com/v2';
  private readonly accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  async createBoard(name: string, description?: string): Promise<MiroBoard> {
    try {
      const response = await axios.post(`${this.miroApiUrl}/boards`, {
        name,
        description,
        policy: {
          permissionsPolicy: {
            collaborationToolsStartAccess: 'all_editors',
            copyAccess: 'anyone',
            sharingAccess: 'team_members_with_editing_rights'
          }
        }
      }, {
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

  async createStickyNote(boardId: string, content: string, x: number, y: number, color: string = 'light_yellow'): Promise<MiroStickyNote> {
    try {
      const response = await axios.post(`${this.miroApiUrl}/boards/${boardId}/items`, {
        type: 'sticky_note',
        data: {
          content: content,
          shape: 'square'
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
    } catch (error) {
      throw new Error(`Failed to create sticky note: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createTextFrame(boardId: string, content: string, x: number, y: number, width: number = 400, height: number = 200): Promise<MiroTextFrame> {
    try {
      const response = await axios.post(`${this.miroApiUrl}/boards/${boardId}/items`, {
        type: 'text',
        data: {
          content: content
        },
        style: {
          fillColor: 'transparent',
          fontSize: '14',
          textAlign: 'left'
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
    } catch (error) {
      throw new Error(`Failed to create text frame: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createFrame(boardId: string, x: number, y: number, width: number, height: number, fillColor: string = 'transparent', borderWidth: number = 1): Promise<any> {
    try {
      const response = await axios.post(`${this.miroApiUrl}/boards/${boardId}/items`, {
        type: 'frame',
        data: {
          title: ''
        },
        style: {
          fillColor: fillColor,
          borderColor: '#e0e0e0',
          borderWidth: borderWidth
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
    } catch (error) {
      throw new Error(`Failed to create frame: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createLearningHourBoard(sessionContent: any): Promise<LearningHourMiroLayout> {
    const boardName = sessionContent.miroContent.boardTitle;
    const board = await this.createBoard(boardName, sessionContent.sessionOverview);
    const style = sessionContent.miroContent.style ?? 'slide';

    const layout: LearningHourMiroLayout = {
      boardId: board.id,
      sections: {
        overview: {} as MiroTextFrame,
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

  private async createSlideLayout(boardId: string, content: any, layout: LearningHourMiroLayout): Promise<LearningHourMiroLayout> {
    const slideSpacing = 1000;
    let currentSlideX = 0;

    for (const section of content.miroContent.sections) {
      const slideX = currentSlideX;
      const slideY = 0;

      await this.createFrame(boardId, slideX - 50, slideY - 50, 900, 700, 'transparent', 2);
      await this.createTextFrame(
        boardId,
        `<h2 style="text-align: center; font-size: 24px; font-weight: bold;">${section.title}</h2>`,
        slideX,
        slideY - 250,
        800,
        80
      );

      if (section.type === 'text_frame') {
        const contentFrame = await this.createTextFrame(
          boardId,
          `<div style="font-size: 16px; line-height: 1.5;">${section.content}</div>`,
          slideX,
          slideY - 100,
          700,
          300
        );
        
        if (section.title === 'Session Overview') {
          layout.sections.overview = contentFrame;
        }
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

  private async createVerticalLayout(boardId: string, content: any, layout: LearningHourMiroLayout): Promise<LearningHourMiroLayout> {
    let currentY = -400;
    const sectionSpacing = 300;

    for (const section of content.miroContent.sections) {
      const sectionY = currentY;
      currentY += sectionSpacing;

      await this.createTextFrame(
        boardId,
        `<h3>${section.title}</h3>`,
        -500,
        sectionY,
        200,
        60
      );

      if (section.type === 'text_frame') {
        const textFrame = await this.createTextFrame(
          boardId,
          `<h2>${section.title}</h2><p>${section.content}</p>`,
          -200,
          sectionY,
          600,
          150
        );
        
        if (section.title === 'Session Overview') {
          layout.sections.overview = textFrame;
        }
      } else if (section.type === 'sticky_notes' && section.items) {
        const stickyNotes: MiroStickyNote[] = [];
        let currentX = -400;

        for (const item of section.items) {
          const note = await this.createStickyNote(
            boardId,
            item,
            currentX,
            sectionY,
            section.color ?? 'light_yellow'
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

  async getBoardViewLink(boardId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.miroApiUrl}/boards/${boardId}`, {
        headers: {
          'authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data.viewLink;
    } catch (error) {
      throw new Error(`Failed to get board view link: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

}
