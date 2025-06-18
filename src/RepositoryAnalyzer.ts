import { GitHubMCPClient } from './GitHubMCPClient';

export interface CodeExample {
  filePath: string;
  lineNumbers: {
    start: number;
    end: number;
  };
  confidenceScore: number;
  complexityRating: string;
  experienceLevel: string;
  codeSnippet: string;
}

export interface AnalysisResult {
  examples: CodeExample[];
  codeSmell: string;
  repositoryUrl: string;
}


export class RepositoryAnalyzer {
  private githubClient: GitHubMCPClient;

  constructor(githubClient: GitHubMCPClient) {
    this.githubClient = githubClient;
  }

  async analyzeRepository(repositoryUrl: string, codeSmell: string): Promise<AnalysisResult> {
    const { owner, repo } = this.parseGitHubUrl(repositoryUrl);
    
    try {
      const searchQueries = this.getSearchQueriesForCodeSmell(codeSmell);
      const examples: CodeExample[] = [];

      for (const query of searchQueries) {
        try {
          const searchResult = await this.githubClient.searchRepositoryFiles(owner, repo, query);
          const items = (searchResult as any)?.content?.[0]?.text ?
            JSON.parse((searchResult as any).content[0].text).items : [];

          for (const item of items.slice(0, 3)) {
            const fileContent = await this.githubClient.getFileContent(owner, repo, item.path);
            const content = this.extractFileContent(fileContent);

            const example = this.analyzeFileForCodeSmell(
              item.path,
              content,
              codeSmell
            );

            if (example) {
              examples.push(example);
            }
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('GitHub MCP client not connected')) {
            throw error;
          }
          console.error(`Search query failed: ${query}`, error);
        }
      }

      if (examples.length === 0) {
        throw new Error(`No examples of '${codeSmell}' found in repository ${repositoryUrl}. Try searching for a different code smell or repository.`);
      }

      return {
        examples: examples.slice(0, 5),
        codeSmell,
        repositoryUrl
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('GitHub MCP client not connected')) {
        throw new Error('GitHub integration not configured. Please ensure GITHUB_TOKEN is set in your environment.');
      }
      throw error;
    }
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
    if (!match) {
      throw new Error("Invalid GitHub URL format");
    }
    return { owner: match[1], repo: match[2] };
  }

  private getSearchQueriesForCodeSmell(codeSmell: string): string[] {
    const codeSmellQueries: Record<string, string[]> = {
      'Feature Envy': [
        'get().get().get()',
        'getCustomer().getAddress()',
        'user.getAccount().getBalance()'
      ],
      'Long Method': [
        'function.*\\{[^}]{300,}\\}',
        'def.*:\\n(?:.*\\n){50,}',
        'public void'
      ],
      'God Class': [
        'class.*\\{[^}]{1000,}\\}',
        'Manager',
        'Controller'
      ],
      'Primitive Obsession': [
        'int.*int.*int.*int',
        'String.*String.*String.*String',
        'ArrayList<String>'
      ]
    };

    return codeSmellQueries[codeSmell] || [codeSmell.toLowerCase()];
  }

  private extractFileContent(fileResponse: any): string {
    try {
      const text = (fileResponse as any)?.content?.[0]?.text;
      if (!text) return '';

      const parsed = JSON.parse(text);
      if (parsed.content) {
        return Buffer.from(parsed.content, 'base64').toString('utf-8');
      }
      return '';
    } catch {
      return '';
    }
  }

  private analyzeFileForCodeSmell(
    filePath: string,
    content: string,
    codeSmell: string
  ): CodeExample | null {
    const lines = content.split('\n');
    const patterns = this.getPatternForCodeSmell(codeSmell);

    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gm');
      let match;

      while ((match = regex.exec(content)) !== null) {
        const startLine = content.substring(0, match.index).split('\n').length;
        const endLine = startLine + match[0].split('\n').length - 1;

        return {
          filePath,
          lineNumbers: { start: startLine, end: endLine },
          confidenceScore: this.calculateConfidence(match[0], codeSmell),
          complexityRating: this.assessComplexity(match[0]),
          experienceLevel: this.determineExperienceLevel(match[0]),
          codeSnippet: match[0].trim()
        };
      }
    }

    return null;
  }

  private getPatternForCodeSmell(codeSmell: string): string[] {
    const patterns: Record<string, string[]> = {
      'Feature Envy': [
        '\\w+\\.get\\w+\\(\\)\\.get\\w+\\(\\)',
        '\\w+\\.\\w+\\(\\)\\.\\w+\\(\\)\\.\\w+\\(\\)',
        'get[A-Z]\\w*\\(\\)\\.[gs]et[A-Z]\\w*\\(\\)'
      ],
      'Long Method': [
        '(function|def|public\\s+\\w+)\\s+\\w+\\s*\\([^)]*\\)\\s*\\{[^}]{200,}\\}',
        'def\\s+\\w+.*?:\\n(\\s{4,}.*\\n){20,}'
      ],
      'God Class': [
        'class\\s+\\w+.*?\\{[^}]{500,}\\}',
        'class\\s+\\w*(Manager|Controller|Service)\\s*'
      ],
      'Primitive Obsession': [
        '(int|string|float|double)\\s+\\w+,\\s*(int|string|float|double)\\s+\\w+,\\s*(int|string|float|double)',
        'List<(String|Integer|Double)>'
      ]
    };

    return patterns[codeSmell] || ['\\b' + codeSmell.toLowerCase().replace(/\s+/g, '.*') + '\\b'];
  }

  private calculateConfidence(code: string, codeSmell: string): number {
    let score = 0.7;

    const featureEnvyMatches = code.match(/\.\w+\(\)\./g);
    if (codeSmell === 'Feature Envy' && featureEnvyMatches && featureEnvyMatches.length >= 2) {
      score += 0.2;
    }
    if (codeSmell === 'Long Method' && code.split('\n').length > 30) {
      score += 0.15;
    }

    return Math.min(score, 0.95);
  }

  private assessComplexity(code: string): string {
    const lines = code.split('\n').length;
    const conditions = (code.match(/if|else|for|while|switch/g) || []).length;

    if (lines > 50 || conditions > 10) return 'high';
    if (lines > 20 || conditions > 5) return 'medium';
    return 'low';
  }

  private determineExperienceLevel(code: string): string {
    const complexity = this.assessComplexity(code);
    if (complexity === 'high') return 'advanced';
    if (complexity === 'medium') return 'intermediate';
    return 'beginner';
  }


}
