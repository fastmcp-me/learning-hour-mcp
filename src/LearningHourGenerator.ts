import axios from 'axios';

interface LearningActivity {
  title: string;
  duration: string;
  description: string;
  instructions: string[];
}

interface MiroSection {
  title: string;
  type: string;
  content?: string;
  color?: string;
  items?: string[];
}

interface MiroContent {
  boardTitle: string;
  sections: MiroSection[];
}

export interface SessionContent {
  topic: string;
  sessionOverview: string;
  learningObjectives: string[];
  activities: LearningActivity[];
  discussionPrompts: string[];
  keyTakeaways: string[];
  miroContent: MiroContent;
}

export interface CodeExample {
  topic: string;
  language: string;
  beforeCode: string;
  afterCode: string;
  problemExplanation: string;
  solutionExplanation: string;
  additionalOpportunities: string[];
}

export class LearningHourGenerator {
  private readonly anthropicApiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly model = 'claude-3-5-sonnet-20241022';

  buildSessionPrompt(topic: string): string {
    return `Create a comprehensive Learning Hour session for Technical Coaches on the topic: "${topic}".

This should follow the 4C Learning Model (Connect → Concept → Concrete → Conclusion) and focus on technical excellence practices that enhance agility.

IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or markdown formatting.
1. A session overview (2-3 sentences explaining what participants will learn and why it matters for technical excellence)
2. Learning objectives (3-4 specific, measurable outcomes)
3. Step-by-step activities (2-4 hands-on exercises following the 4C model)
4. Discussion prompts for group reflection (4-5 thoughtful questions about real-world application)
5. Key takeaways (3-4 main points to remember)
6. Miro board structure with sticky note content for visual facilitation

Format your response as JSON with this exact structure:
{
  "topic": "${topic}",
  "sessionOverview": "Brief description of what participants will learn and why it enhances technical excellence",
  "learningObjectives": [
    "Participants will be able to identify ${topic} in their codebase",
    "Participants will understand the impact of ${topic} on code maintainability",
    "Participants will practice refactoring techniques to address ${topic}"
  ],
  "activities": [
    {
      "title": "Connect: Share Experience",
      "duration": "10 minutes",
      "description": "Participants share experiences with ${topic}",
      "instructions": ["Form pairs", "Share a time you encountered ${topic}", "Discuss impact on development"]
    },
    {
      "title": "Concept: Understand the Problem",
      "duration": "15 minutes", 
      "description": "Learn to identify and understand ${topic}",
      "instructions": ["Review code examples", "Identify problem patterns", "Discuss why it matters"]
    }
  ],
  "discussionPrompts": [
    "How does ${topic} impact your team's velocity?",
    "What strategies help prevent ${topic}?",
    "When might ${topic} be acceptable technical debt?",
    "How do you communicate ${topic} risks to stakeholders?"
  ],
  "keyTakeaways": [
    "${topic} reduces code maintainability and team velocity",
    "Early detection prevents costly refactoring later",
    "Consistent practices help prevent ${topic}"
  ],
  "miroContent": {
    "boardTitle": "Learning Hour: ${topic}",
    "sections": [
      {
        "title": "Session Overview",
        "type": "text_frame",
        "content": "session overview content"
      },
      {
        "title": "Learning Objectives",
        "type": "sticky_notes",
        "color": "light_blue",
        "items": ["objective 1", "objective 2", "objective 3"]
      },
      {
        "title": "Activities",
        "type": "sticky_notes",
        "color": "light_green",
        "items": ["activity 1", "activity 2"]
      },
      {
        "title": "Discussion Questions", 
        "type": "sticky_notes",
        "color": "light_yellow",
        "items": ["question 1", "question 2", "question 3", "question 4"]
      },
      {
        "title": "Key Takeaways",
        "type": "sticky_notes",
        "color": "light_pink", 
        "items": ["takeaway 1", "takeaway 2", "takeaway 3"]
      }
    ]
  }
}

Ensure all content is specific to ${topic} and provides practical value for software development teams.`;
  }

  buildCodeExamplePrompt(topic: string, language: string): string {
    return `Create detailed before/after code examples for the topic "${topic}" in ${language}.

Focus on practical examples that clearly demonstrate the problem and solution.

IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or markdown formatting.
1. A "before" code example that clearly demonstrates the ${topic} problem
2. An "after" code example showing the refactored solution
3. Explanation of what was problematic in the original code
4. Explanation of how the refactoring improves the code
5. Additional refactoring opportunities for further improvement

Format as JSON:
{
  "topic": "${topic}",
  "language": "${language}",
  "beforeCode": "// Code that demonstrates ${topic} problem\\nclass Example {\\n    // problematic implementation\\n}",
  "afterCode": "// Refactored code that solves ${topic}\\nclass Example {\\n    // improved implementation\\n}",
  "problemExplanation": "Specific explanation of what made the original code problematic regarding ${topic}",
  "solutionExplanation": "Detailed explanation of how the refactoring addresses ${topic} and improves code quality",
  "additionalOpportunities": [
    "First potential improvement",
    "Second potential improvement", 
    "Third potential improvement"
  ]
}

Make the code examples realistic and representative of real-world scenarios where ${topic} commonly occurs.`;
  }

  async generateSessionContent(topic: string): Promise<SessionContent> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    const prompt = this.buildSessionPrompt(topic);

    try {
      const response = await axios.post(this.anthropicApiUrl, {
        model: this.model,
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }, {
        headers: {
          'content-type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      });

      const content = response.data.content[0].text;
      const sessionData = JSON.parse(content);
      this.validateSessionContent(sessionData);

      return sessionData;
    } catch (error) {
      throw new Error(`Failed to generate session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateCodeExample(topic: string, language: string = 'java'): Promise<CodeExample> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    const prompt = this.buildCodeExamplePrompt(topic, language);

    try {
      const response = await axios.post(this.anthropicApiUrl, {
        model: this.model,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }, {
        headers: {
          'content-type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      });

      const content = response.data.content[0].text;
      const exampleData = JSON.parse(content);
      this.validateCodeExample(exampleData);

      return exampleData;
    } catch (error) {
      throw new Error(`Failed to generate code example: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateSessionContent(data: any): void {
    const required = ['topic', 'sessionOverview', 'learningObjectives', 'activities', 'discussionPrompts', 'keyTakeaways', 'miroContent'];

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(data.learningObjectives) || data.learningObjectives.length < 3) {
      throw new Error('learningObjectives must be an array with at least 3 items');
    }

    if (!Array.isArray(data.activities) || data.activities.length < 2) {
      throw new Error('activities must be an array with at least 2 items');
    }

    data.activities.forEach((activity: any, index: number) => {
      const activityRequired = ['title', 'duration', 'description', 'instructions'];
      for (const field of activityRequired) {
        if (!activity[field]) {
          throw new Error(`Activity ${index} missing required field: ${field}`);
        }
      }
      if (!Array.isArray(activity.instructions)) {
        throw new Error(`Activity ${index} instructions must be an array`);
      }
    });

    if (!data.miroContent.boardTitle || !Array.isArray(data.miroContent.sections)) {
      throw new Error('miroContent must have boardTitle and sections array');
    }
  }

  private validateCodeExample(data: any): void {
    const required = ['topic', 'language', 'beforeCode', 'afterCode', 'problemExplanation', 'solutionExplanation', 'additionalOpportunities'];

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(data.additionalOpportunities)) {
      throw new Error('additionalOpportunities must be an array');
    }

    if (data.beforeCode.length < 10 || data.afterCode.length < 10) {
      throw new Error('Code examples must be substantial (at least 10 characters)');
    }
  }

}
