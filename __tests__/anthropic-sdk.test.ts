import { describe, it, expect, beforeEach } from 'vitest';
import {LearningHourGenerator} from '../src/LearningHourGenerator';
import {validateCodeExample, validateSessionContent} from '../src/schemas';


describe('Anthropic SDK', () => {

    let generator: LearningHourGenerator;

    beforeEach(() => {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY environment variable is required for integration tests');
        }
        generator = new LearningHourGenerator();
    });

    it.skip('should generate real session content using Anthropic API', async () => {
        const topic = 'Feature Envy';

        const result = await generator.generateSessionContent(topic);

        // Validate against schema
        const isValid = validateSessionContent(result);
        if (!isValid) {
            console.error('Validation errors:', validateSessionContent.errors);
        }
        expect(isValid).toBe(true);

        // Verify structure
        expect(result.topic).toBe(topic);
        expect(result.sessionOverview).toBeDefined();
        expect(result.learningObjectives).toBeInstanceOf(Array);
        expect(result.learningObjectives.length).toBeGreaterThanOrEqual(3);

        // Verify activities follow 4C model
        expect(result.activities).toBeInstanceOf(Array);
        expect(result.activities.length).toBeGreaterThanOrEqual(4);
        expect(result.activities[0].title).toContain('Connect');
        expect(result.activities[1].title).toContain('Concept');
        expect(result.activities[2].title).toContain('Concrete');
        expect(result.activities[3].title).toContain('Conclusion');

        // Verify Miro content
        expect(result.miroContent).toBeDefined();
        expect(result.miroContent.boardTitle).toContain(topic);
        expect(result.miroContent.sections).toBeInstanceOf(Array);
        expect(result.miroContent.sections.length).toBeGreaterThanOrEqual(4);

        // Verify at least one code example section
        const codeExampleSection = result.miroContent.sections.find(s => s.type === 'code_examples');
        expect(codeExampleSection).toBeDefined();
        if (codeExampleSection) {
            expect(codeExampleSection.beforeCode).toBeDefined();
            expect(codeExampleSection.afterCode).toBeDefined();
        }
    }, 30000);

    it.skip('should generate real code examples using Anthropic API', async () => {
        const topic = 'Extract Method';
        const language = 'typescript';

        const result = await generator.generateCodeExample(topic, language);

        const isValid = validateCodeExample(result);

        expect(isValid).toBe(true);
        expect(result.topic).toBe(topic);
        expect(result.language).toBe(language);
    }, 30000);
});
