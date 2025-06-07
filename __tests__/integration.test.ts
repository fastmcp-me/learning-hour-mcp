import { LearningHourGenerator } from '../src/LearningHourGenerator';
import { validateCodeExample, validateSessionContent } from '../src/schemas';

describe('Learning Hour MCP Integration Tests', () => {
  let generator: LearningHourGenerator;

  beforeEach(() => {
    generator = new LearningHourGenerator();
  });

  describe('Anthropic API Integration', () => {
    beforeEach(() => {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required for integration tests');
      }
    });

    it('should generate real session content using Anthropic API', async () => {
      const topic = 'Feature Envy';

      const result = await generator.generateSessionContent(topic);

      const isValid = validateSessionContent(result);

      console.log(`LLM RESPONSE ABOUT CODE EXAMPLES: ${JSON.stringify(result, null, 2)}\n`);

      expect(isValid).toBe(true);
      expect(result.topic).toBe(topic);
    }, 30000);

    it('should generate real code examples using Anthropic API', async () => {
      const topic = 'Extract Method';
      const language = 'typescript';

      const result = await generator.generateCodeExample(topic, language);

      const isValid = validateCodeExample(result);

      console.log(`LLM RESPONSE ABOUT CODE EXAMPLES: ${JSON.stringify(result, null, 2)}\n`);
      expect(isValid).toBe(true);
      expect(result.topic).toBe(topic);
      expect(result.language).toBe(language);
    }, 30000);
  });
});
