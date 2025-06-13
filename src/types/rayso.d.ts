declare module 'rayso' {
  export interface RaySoOptions {
    title?: string;
    theme?: string;
    background?: boolean;
    darkMode?: boolean;
    padding?: number | string;
    language?: string;
    localPreview?: boolean;
    localPreviewPath?: string;
    debug?: boolean;
  }

  export default class RaySo {
    constructor(options?: RaySoOptions);
    cook(code: string): Promise<Buffer>;
  }
}