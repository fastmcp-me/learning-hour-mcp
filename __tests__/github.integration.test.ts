import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GitHubMCPClient } from '../src/GitHubMCPClient.js';
import { RepositoryAnalyzer } from '../src/RepositoryAnalyzer.js';
import { TechStackAnalyzer } from '../src/TechStackAnalyzer.js';

describe('GitHub MCP Integration', () => {
  let githubClient: GitHubMCPClient;
  let repositoryAnalyzer: RepositoryAnalyzer;
  let techStackAnalyzer: TechStackAnalyzer;

  const originalEnv = process.env;

  beforeAll(async () => {
    // Skip these tests if GITHUB_TOKEN is not set
    if (!process.env.GITHUB_TOKEN) {
      console.warn('GITHUB_TOKEN not set, skipping GitHub integration tests');
      return;
    }

    githubClient = new GitHubMCPClient();
    repositoryAnalyzer = new RepositoryAnalyzer(githubClient);
    techStackAnalyzer = new TechStackAnalyzer(githubClient);

    // Only connect if we have a token
    if (process.env.GITHUB_TOKEN) {
      await githubClient.connect();
    }
  });

  afterAll(async () => {
    // Restore original environment
    process.env = originalEnv;

    // Disconnect if connected
    if (githubClient) {
      await githubClient.disconnect();
    }
  });

  describe('Repository Analysis', () => {
    it('should analyze a real repository when GITHUB_TOKEN is set', async () => {
      if (!process.env.GITHUB_TOKEN) {
        console.log('Skipping: GITHUB_TOKEN not set');
        return;
      }

      try {
        const analysisResult = await repositoryAnalyzer.analyzeRepository(
          'https://github.com/SDiamante13/tdd-coach',
          'Feature Envy'
        );

        expect(analysisResult).toBeDefined();
        expect(analysisResult.codeSmell).toBe('Feature Envy');
        expect(analysisResult.repositoryUrl).toBe('https://github.com/SDiamante13/tdd-coach');
        expect(analysisResult.examples).toBeInstanceOf(Array);
        expect(analysisResult.examples.length).toBeGreaterThan(0);
      } catch (error: any) {
        // It's OK if no examples are found - the error message should be clear
        expect(error.message).toContain('No examples of');
      }
    });
  });

  describe('Without Github Token', () => {
    it('should throw error when GitHub integration not configured', async () => {
      // Create a new client without token
      const envBackup = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const clientWithoutToken = new GitHubMCPClient();
      const analyzerWithoutToken = new RepositoryAnalyzer(clientWithoutToken);

      await expect(
        analyzerWithoutToken.analyzeRepository(
          'https://github.com/SDiamante13/tdd-coach',
          'Feature Envy'
        )
      ).rejects.toThrow('GitHub integration not configured');

      // Restore token
      if (envBackup) {
        process.env.GITHUB_TOKEN = envBackup;
      }
    });

    it('should throw error for invalid repository URLs', async () => {
      await expect(
        repositoryAnalyzer.analyzeRepository(
          'invalid-url',
          'Feature Envy'
        )
      ).rejects.toThrow('Invalid GitHub URL format');
    });
  });

  describe('Tech Stack Analysis', () => {
    it('should analyze tech stack when GITHUB_TOKEN is set', async () => {
      if (!process.env.GITHUB_TOKEN) {
        console.log('Skipping: GITHUB_TOKEN not set');
        return;
      }

      const result = await techStackAnalyzer.analyzeTechStack(
        'https://github.com/SDiamante13/tdd-coach'
      );

      expect(result).toBeDefined();
      expect(result.primaryLanguages).toBeInstanceOf(Array);
      expect(result.frameworks).toBeInstanceOf(Array);
      expect(result.testingFrameworks).toBeInstanceOf(Array);
      expect(result.buildTools).toBeInstanceOf(Array);
      expect(result.architecturalPatterns).toBeInstanceOf(Array);
      expect(result.packageDependencies).toBeInstanceOf(Array);
    });

    it('should throw error when GitHub integration not configured', async () => {
      // Create a new client without token
      const envBackup = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const clientWithoutToken = new GitHubMCPClient();
      const analyzerWithoutToken = new TechStackAnalyzer(clientWithoutToken);

      await expect(
        analyzerWithoutToken.analyzeTechStack(
          'https://github.com/SDiamante13/tdd-coach'
        )
      ).rejects.toThrow('GitHub integration not configured');

      // Restore token
      if (envBackup) {
        process.env.GITHUB_TOKEN = envBackup;
      }
    });

    it('should throw error for invalid repository URLs', async () => {
      await expect(
        techStackAnalyzer.analyzeTechStack(
          'invalid-url'
        )
      ).rejects.toThrow('Invalid GitHub URL format');
    });
  });
});
