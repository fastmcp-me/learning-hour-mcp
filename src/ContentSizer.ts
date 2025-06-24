export interface Dimensions {
  width: number;
  height: number;
}

export class ContentSizer {
  private readonly charWidth = 10; // Average character width in pixels for 18pt font
  private readonly lineHeight = 28; // Line height in pixels for 18pt font
  private readonly padding = 40; // Padding around content
  private readonly minWidth = 300;
  private readonly minHeight = 200;
  private readonly maxWidth = 1200;

  calculateTextDimensions(text: string, maxWidth: number = 800): Dimensions {
    if (!text) {
      return { width: this.minWidth, height: this.minHeight };
    }

    const lines = this.wrapText(text, maxWidth);
    const contentHeight = lines.length * this.lineHeight;
    const contentWidth = Math.min(
      Math.max(...lines.map(line => line.length * this.charWidth)),
      maxWidth
    );

    return {
      width: Math.max(contentWidth + this.padding * 2, this.minWidth),
      height: Math.max(contentHeight + this.padding * 2, this.minHeight)
    };
  }

  calculateFrameDimensions(content: string | undefined, title: string): Dimensions {
    const titleDimensions = this.calculateTextDimensions(title, 600);
    
    if (!content) {
      return {
        width: Math.max(titleDimensions.width, 400),
        height: 300
      };
    }

    const contentDimensions = this.calculateTextDimensions(content, 800);
    
    return {
      width: Math.min(Math.max(contentDimensions.width, titleDimensions.width + 100), this.maxWidth),
      height: contentDimensions.height + 100 // Extra space for title
    };
  }

  calculateCodeBlockDimensions(code: string, language: string): Dimensions {
    const lines = code.split('\n');
    const longestLine = Math.max(...lines.map(line => line.length));
    
    return {
      width: Math.min(Math.max(longestLine * 10 + this.padding * 2, 400), 1000),
      height: Math.max(lines.length * 24 + this.padding * 2, 200)
    };
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const maxCharsPerLine = Math.floor(maxWidth / this.charWidth);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }
}