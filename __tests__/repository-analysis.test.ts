import { RepositoryAnalyzer } from '../src/RepositoryAnalyzer';
import { GitHubMCPClient } from '../src/GitHubMCPClient';

describe('Repository Analysis for Learning Opportunities', () => {
  let analyzer: RepositoryAnalyzer;
  let mockGitHubClient: GitHubMCPClient;

  beforeEach(() => {
    mockGitHubClient = new GitHubMCPClient();
    analyzer = new RepositoryAnalyzer(mockGitHubClient);
  });

  it('should validate repository URL format', async () => {
    await expect(
      analyzer.analyzeRepository('invalid-url', 'Feature Envy')
    ).rejects.toThrow('Invalid GitHub URL format');
  });

  it('should throw error when GitHub client not connected', async () => {
    await expect(
      analyzer.analyzeRepository('https://github.com/test/repo', 'Feature Envy')
    ).rejects.toThrow('GitHub integration not configured');
  });
});