import { RepositoryAnalyzer } from '../src/RepositoryAnalyzer';

describe('Repository Analysis for Learning Opportunities', () => {
  let analyzer: RepositoryAnalyzer;

  beforeEach(() => {
    analyzer = new RepositoryAnalyzer();
  });

  it('should find real code smell examples for Feature Envy', async () => {
    const mockGitHubUrl = 'https://github.com/test/repo';
    const codeSmell = 'Feature Envy';
    
    const result = await analyzer.analyzeRepository(mockGitHubUrl, codeSmell);
    
    expect(result).toBeDefined();
    expect(result.examples).toHaveLength(3); // 3-5 examples as per requirements
    expect(result.examples[0]).toMatchObject({
      filePath: expect.any(String),
      lineNumbers: expect.objectContaining({
        start: expect.any(Number),
        end: expect.any(Number)
      }),
      confidenceScore: expect.any(Number),
      complexityRating: expect.any(String),
      experienceLevel: expect.any(String),
      codeSnippet: expect.any(String)
    });
    
    // Verify confidence scores are between 0-1
    result.examples.forEach(example => {
      expect(example.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(example.confidenceScore).toBeLessThanOrEqual(1);
    });
    
    // Verify experience levels are valid
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    result.examples.forEach(example => {
      expect(validLevels).toContain(example.experienceLevel);
    });
  });

  it('should generate team-specific refactoring examples', async () => {
    const example = {
      filePath: 'src/UserService.java',
      lineNumbers: { start: 45, end: 67 },
      confidenceScore: 0.85,
      complexityRating: 'medium',
      experienceLevel: 'intermediate',
      codeSnippet: 'public void updateUser(User user) {\n  user.getAccount().setBalance(calculateNewBalance());\n  user.getProfile().updateLastLogin();\n}'
    };
    
    const result = await analyzer.generateRefactoringExample(example);
    
    expect(result).toBeDefined();
    expect(result.before).toContain('UserService');
    expect(result.after).toContain('UserService');
    expect(result.explanation).toBeTruthy();
    expect(result.preservesStyle).toBe(true);
    expect(result.sessionContent).toContain('Let\'s improve our UserService class');
  });

  it('should protect sensitive business information', async () => {
    const mockRepoUrl = 'https://github.com/test/financial-app';
    const sensitiveCode = `public void processPayment(CreditCard card) {
      apiKey = "sk_live_abc123_secret";
      customerData.ssn = "123-45-6789";
      proxyServer.connect("internal.bank.com");
    }`;
    
    const result = await analyzer.anonymizeExample(sensitiveCode);
    
    expect(result.anonymizedCode).not.toContain('sk_live_abc123_secret');
    expect(result.anonymizedCode).not.toContain('123-45-6789');
    expect(result.anonymizedCode).not.toContain('internal.bank.com');
    expect(result.anonymizedCode).toContain('PLACEHOLDER_API_KEY');
    expect(result.isSafeToUse).toBe(true);
    expect(result.flaggedElements).toHaveLength(3);
  });
});