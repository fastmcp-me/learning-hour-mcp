import { GitHubMCPClient } from '../src/GitHubMCPClient';
import { RepositoryAnalyzer } from '../src/RepositoryAnalyzer';
import { TechStackAnalyzer } from '../src/TechStackAnalyzer';

describe('GitHub MCP Integration', () => {
  let githubClient: GitHubMCPClient;
  let repositoryAnalyzer: RepositoryAnalyzer;
  let techStackAnalyzer: TechStackAnalyzer;

  beforeAll(() => {
    githubClient = new GitHubMCPClient();
    repositoryAnalyzer = new RepositoryAnalyzer(githubClient);
    techStackAnalyzer = new TechStackAnalyzer(githubClient);
  });

  describe('Repository Analysis', () => {
    it('should throw error when GitHub integration not configured', async () => {
      await expect(
        repositoryAnalyzer.analyzeRepository(
          'https://github.com/example/repo',
          'Feature Envy'
        )
      ).rejects.toThrow('GitHub integration not configured');
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
    it('should throw error when GitHub integration not configured', async () => {
      await expect(
        techStackAnalyzer.analyzeTechStack(
          'https://github.com/example/repo'
        )
      ).rejects.toThrow('GitHub integration not configured');
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