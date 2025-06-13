import { GitHubMCPClient } from './GitHubMCPClient.js';

export interface TechStackProfile {
  primaryLanguages: string[];
  frameworks: string[];
  testingFrameworks: string[];
  buildTools: string[];
  architecturalPatterns: string[];
  packageDependencies: string[];
}

export interface StackSpecificContent {
  examples: string;
  testExamples: string;
  refactoringOpportunities: string;
  packageReferences: string;
}

export class TechStackAnalyzer {
  private githubClient: GitHubMCPClient;

  constructor(githubClient: GitHubMCPClient) {
    this.githubClient = githubClient;
  }

  async analyzeTechStack(repositoryUrl: string): Promise<TechStackProfile> {
    const { owner, repo } = this.parseGitHubUrl(repositoryUrl);
    
    try {
      const configFiles = await this.getConfigurationFiles(owner, repo);
      const repoInfo = await this.githubClient.getRepositoryInfo(owner, repo);
      
      const primaryLanguages = this.extractLanguages(repoInfo);
      const { frameworks, testingFrameworks, buildTools, dependencies } = 
        await this.analyzeConfigFiles(owner, repo, configFiles);
      const architecturalPatterns = await this.detectArchitecturalPatterns(owner, repo);

      if (primaryLanguages.length === 0 && frameworks.length === 0) {
        throw new Error(`Unable to analyze tech stack for ${repositoryUrl}. Ensure the repository exists and is accessible.`);
      }

      return {
        primaryLanguages,
        frameworks,
        testingFrameworks,
        buildTools,
        architecturalPatterns,
        packageDependencies: dependencies
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

  private async getConfigurationFiles(owner: string, repo: string): Promise<string[]> {
    const configFileNames = [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pom.xml',
      'build.gradle',
      'requirements.txt',
      'Gemfile',
      'composer.json',
      'Cargo.toml',
      'go.mod',
      'tsconfig.json',
      'jest.config.js',
      '.babelrc',
      'webpack.config.js'
    ];

    const foundFiles: string[] = [];
    
    try {
      const rootContents = await this.githubClient.getRepositoryStructure(owner, repo);
      const items = this.extractItems(rootContents);
      
      for (const item of items) {
        if (configFileNames.includes(item.name)) {
          foundFiles.push(item.name);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('GitHub MCP client not connected')) {
        throw error;
      }
      console.error("Failed to get repository structure:", error);
    }

    return foundFiles;
  }

  private extractItems(response: any): any[] {
    try {
      const text = (response as any)?.content?.[0]?.text;
      if (!text) return [];
      return JSON.parse(text) || [];
    } catch {
      return [];
    }
  }

  private extractLanguages(repoInfo: any): string[] {
    try {
      const text = (repoInfo as any)?.content?.[0]?.text;
      if (!text) return ['JavaScript'];
      
      const parsed = JSON.parse(text);
      const languages: string[] = [];
      
      if (parsed.language) {
        languages.push(parsed.language);
      }
      
      return languages.length > 0 ? languages : ['JavaScript'];
    } catch {
      return ['JavaScript'];
    }
  }

  private async analyzeConfigFiles(
    owner: string, 
    repo: string, 
    configFiles: string[]
  ): Promise<{
    frameworks: string[];
    testingFrameworks: string[];
    buildTools: string[];
    dependencies: string[];
  }> {
    const result = {
      frameworks: [] as string[],
      testingFrameworks: [] as string[],
      buildTools: [] as string[],
      dependencies: [] as string[]
    };

    for (const file of configFiles) {
      try {
        const content = await this.githubClient.getFileContent(owner, repo, file);
        const fileData = this.parseFileContent(content);
        
        if (file === 'package.json' && fileData) {
          result.dependencies = Object.keys(fileData.dependencies || {});
          const allDeps = [
            ...Object.keys(fileData.dependencies || {}),
            ...Object.keys(fileData.devDependencies || {})
          ];
          
          result.frameworks.push(...this.detectFrameworks(allDeps));
          result.testingFrameworks.push(...this.detectTestingFrameworks(allDeps));
          result.buildTools.push(...this.detectBuildTools(fileData, allDeps));
        }
        
        if (file === 'pom.xml') {
          result.buildTools.push('Maven');
        }
        
        if (file === 'build.gradle') {
          result.buildTools.push('Gradle');
        }
        
        if (file === 'requirements.txt') {
          result.buildTools.push('pip');
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('GitHub MCP client not connected')) {
          throw error;
        }
        console.error(`Failed to analyze ${file}:`, error);
      }
    }

    return {
      frameworks: [...new Set(result.frameworks)],
      testingFrameworks: [...new Set(result.testingFrameworks)],
      buildTools: [...new Set(result.buildTools)],
      dependencies: result.dependencies.slice(0, 10)
    };
  }

  private parseFileContent(fileResponse: any): any {
    try {
      const text = (fileResponse as any)?.content?.[0]?.text;
      if (!text) return null;
      
      const parsed = JSON.parse(text);
      if (parsed.content) {
        const content = Buffer.from(parsed.content, 'base64').toString('utf-8');
        return JSON.parse(content);
      }
      return null;
    } catch {
      return null;
    }
  }

  private detectFrameworks(dependencies: string[]): string[] {
    const frameworks: string[] = [];
    const frameworkMap: Record<string, string> = {
      'react': 'React',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'express': 'Express',
      'next': 'Next.js',
      'gatsby': 'Gatsby',
      'svelte': 'Svelte',
      'fastify': 'Fastify',
      'koa': 'Koa',
      'nestjs': 'NestJS',
      'django': 'Django',
      'flask': 'Flask',
      'rails': 'Ruby on Rails',
      'spring': 'Spring'
    };

    for (const dep of dependencies) {
      for (const [key, value] of Object.entries(frameworkMap)) {
        if (dep.toLowerCase().includes(key)) {
          frameworks.push(value);
        }
      }
    }

    return frameworks;
  }

  private detectTestingFrameworks(dependencies: string[]): string[] {
    const testFrameworks: string[] = [];
    const testFrameworkMap: Record<string, string> = {
      'jest': 'Jest',
      'mocha': 'Mocha',
      'jasmine': 'Jasmine',
      'cypress': 'Cypress',
      'playwright': 'Playwright',
      'testing-library': 'Testing Library',
      'vitest': 'Vitest',
      'pytest': 'pytest',
      'unittest': 'unittest',
      'rspec': 'RSpec'
    };

    for (const dep of dependencies) {
      for (const [key, value] of Object.entries(testFrameworkMap)) {
        if (dep.toLowerCase().includes(key)) {
          testFrameworks.push(value);
        }
      }
    }

    return testFrameworks;
  }

  private detectBuildTools(packageJson: any, dependencies: string[]): string[] {
    const buildTools: string[] = [];
    
    if (packageJson?.scripts) {
      buildTools.push('npm');
    }
    
    const buildToolMap: Record<string, string> = {
      'webpack': 'webpack',
      'vite': 'Vite',
      'rollup': 'Rollup',
      'parcel': 'Parcel',
      'esbuild': 'esbuild',
      'turbo': 'Turborepo',
      'lerna': 'Lerna'
    };

    for (const dep of dependencies) {
      for (const [key, value] of Object.entries(buildToolMap)) {
        if (dep.toLowerCase().includes(key)) {
          buildTools.push(value);
        }
      }
    }

    return buildTools;
  }

  private async detectArchitecturalPatterns(owner: string, repo: string): Promise<string[]> {
    const patterns: string[] = [];
    
    try {
      const structureIndicators = [
        { path: 'api', pattern: 'REST API' },
        { path: 'graphql', pattern: 'GraphQL' },
        { path: 'components', pattern: 'Component-based UI' },
        { path: 'microservices', pattern: 'Microservices' },
        { path: 'controllers', pattern: 'MVC' },
        { path: 'models', pattern: 'MVC' },
        { path: 'views', pattern: 'MVC' },
        { path: 'domain', pattern: 'Domain-Driven Design' },
        { path: 'infrastructure', pattern: 'Clean Architecture' }
      ];

      const rootContents = await this.githubClient.getRepositoryStructure(owner, repo);
      const items = this.extractItems(rootContents);
      
      for (const item of items) {
        for (const { path, pattern } of structureIndicators) {
          if (item.name.toLowerCase().includes(path) && item.type === 'dir') {
            patterns.push(pattern);
          }
        }
      }
    } catch (error) {
      console.error("Failed to detect architectural patterns:", error);
    }

    return [...new Set(patterns)].slice(0, 5);
  }


  async generateStackSpecificContent(topic: string, techProfile: TechStackProfile): Promise<StackSpecificContent> {
    return {
      examples: `Express route handlers demonstrating ${topic} principles with middleware patterns`,
      testExamples: `Jest testing examples that match existing test structure for ${topic}`,
      refactoringOpportunities: `Node.js-specific ${topic} refactoring opportunities`,
      packageReferences: `Using lodash for ${topic} implementations`
    };
  }
}