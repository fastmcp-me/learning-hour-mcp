interface RayCodeOptions {
  code: string;
  language?: string;
  theme?: 'breeze' | 'candy' | 'crimson' | 'falcon' | 'meadow' | 'midnight' | 'raindrop' | 'sunset';
  background?: boolean;
  darkMode?: boolean;
  padding?: number;
  title?: string;
}

export interface CodeImage {
  url: string;
  buffer?: Buffer;
  width: number;
  height: number;
}

let RaySoModule: any = null;
let isGenerating = false;

export class CodeImageGenerator {
  private imageCache = new Map<string, CodeImage>();

  async generateCodeImage(options: RayCodeOptions): Promise<CodeImage | null> {
    const cacheKey = this.getCacheKey(options);

    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    // Wait if another generation is in progress
    while (isGenerating) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    isGenerating = true;

    try {
      if (!RaySoModule) {
        const dynamicImport = new Function('specifier', 'return import(specifier)');
        const module = await dynamicImport('rayso');
        RaySoModule = module.default;
      }

      // Create a new RaySo instance for this generation
      const raySo = new RaySoModule({
        title: options.title || 'Untitled',
        theme: options.theme || 'midnight',
        background: options.background ?? true,
        darkMode: options.darkMode ?? true,
        padding: options.padding || 32,
        language: options.language || 'auto'
      });

      const imageBuffer = await raySo.cook(options.code);

      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      const imageInfo: CodeImage = {
        url: imageUrl,
        buffer: imageBuffer,
        width: 800,
        height: 400
      };

      this.imageCache.set(cacheKey, imageInfo);
      return imageInfo;
    } catch (error: any) {
      console.error('Failed to generate code image:', error.message);
      throw error;
    } finally {
      isGenerating = false;
    }
  }
  cleanCodeSnippet(code: string): string {
    const codeBlockRegex = /^```\w*\n([\s\S]*?)\n```$/;
    const match = code.match(codeBlockRegex);
    return match ? match[1] : code;
  }

  private getCacheKey(options: RayCodeOptions): string {
    return JSON.stringify({
      code: options.code,
      language: options.language,
      theme: options.theme,
      darkMode: options.darkMode
    });
  }
}
