import { TechStackAnalyzer } from '../src/TechStackAnalyzer.js';
import { GitHubMCPClient } from '../src/GitHubMCPClient.js';

describe('Technology Stack Adaptation', () => {
  let analyzer: TechStackAnalyzer;
  let mockGitHubClient: GitHubMCPClient;

  beforeEach(() => {
    mockGitHubClient = new GitHubMCPClient();
    analyzer = new TechStackAnalyzer(mockGitHubClient);
  });

  it('should validate repository URL format', async () => {
    await expect(
      analyzer.analyzeTechStack('invalid-url')
    ).rejects.toThrow('Invalid GitHub URL format');
  });

  it('should throw error when GitHub client not connected', async () => {
    await expect(
      analyzer.analyzeTechStack('https://github.com/test/node-express-app')
    ).rejects.toThrow('GitHub integration not configured');
  });
});