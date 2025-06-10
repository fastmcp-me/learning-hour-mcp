import { TechStackAnalyzer } from '../src/TechStackAnalyzer';

describe('Technology Stack Adaptation', () => {
  let analyzer: TechStackAnalyzer;

  beforeEach(() => {
    analyzer = new TechStackAnalyzer();
  });

  it('should detect team\'s technology profile', async () => {
    const repositoryUrl = 'https://github.com/test/node-express-app';
    
    const result = await analyzer.analyzeTechStack(repositoryUrl);
    
    expect(result).toBeDefined();
    expect(result.primaryLanguages).toContain('JavaScript');
    expect(result.frameworks).toEqual(expect.arrayContaining(['Express', 'React']));
    expect(result.testingFrameworks).toContain('Jest');
    expect(result.buildTools).toContain('npm');
    expect(result.architecturalPatterns).toContain('REST API');
    expect(result.packageDependencies).toEqual(expect.arrayContaining(['lodash', 'axios']));
  });

  it('should generate stack-specific examples for Clean Code Learning Hour', async () => {
    const techProfile = {
      primaryLanguages: ['JavaScript'],
      frameworks: ['Express', 'Node.js'],
      testingFrameworks: ['Jest'],
      buildTools: ['npm'],
      architecturalPatterns: ['REST API'],
      packageDependencies: ['express', 'lodash']
    };
    
    const result = await analyzer.generateStackSpecificContent('Clean Code', techProfile);
    
    expect(result).toBeDefined();
    expect(result.examples).toContain('Express');
    expect(result.examples).toContain('middleware');
    expect(result.testExamples).toContain('Jest');
    expect(result.refactoringOpportunities).toContain('Node.js');
    expect(result.packageReferences).toContain('lodash');
  });
});