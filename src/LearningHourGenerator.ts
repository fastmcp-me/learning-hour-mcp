import Anthropic from '@anthropic-ai/sdk';

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
  language?: string;
  beforeCode?: string;
  afterCode?: string;
}

interface MiroContent {
  boardTitle: string;
  style?: string;
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

export interface RefactoringStep {
  stepNumber: number;
  description: string;
  code: string;
  testCode?: string;
  codeSmells: string[];
  improvements: string[];
  facilitationTip: string;
}

export interface CodeExample {
  topic: string;
  language: string;
  context: string;
  refactoringSteps: RefactoringStep[];
  problemStatement: string;
  learningHourConnection: string;
  additionalExercises: string[];
  facilitationNotes: {
    timeAllocation: string;
    commonMistakes: string[];
    discussionPoints: string[];
    pairProgrammingTips: string[];
  };
}

export class LearningHourGenerator {
  private readonly client: Anthropic;
  private readonly model = 'claude-3-5-sonnet-20241022';

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  buildSessionPrompt(topic: string, style: string = 'slide'): string {
    return this.loadSessionPrompt(topic, style);
  }

  private loadSessionPrompt(topic: string, style: string) {
    return `Create a Learning Hour session on "${topic}" that enables deliberate practice of technical excellence skills.

CONTEXT: Learning Hours are structured practice sessions where teams develop fundamental programming skills through hands-on coding. They follow the 4C Learning Model (Connect → Concept → Concrete → Conclusion) and focus on timeless practices: TDD, refactoring, clean code, evolutionary design, pairing/mobbing, and CI/CD.

PHILOSOPHY: "Continuous attention to technical excellence and good design enhances agility" - The 9th principle of the Agile Manifesto. Just as athletes and pilots dedicate time to practice, developers need dedicated time to master fundamental practices that stand the test of time.

CRITICAL REQUIREMENTS:
- Focus on DELIBERATE PRACTICE - participants must write code, not just discuss concepts
- Connect to participants' REAL WORK - use examples they'll encounter in their codebases
- Emphasize MICRO-SKILLS - break down complex practices into small, practicable units
- Create PSYCHOLOGICAL SAFETY - activities should encourage experimentation and learning from mistakes
- Enable TECHNICAL COACHES to facilitate effectively with clear guidance

Design a session following the 4C Model:

1. CONNECT (5-10 minutes): Activate prior knowledge and create psychological safety
   - Start with participants' existing experiences with ${topic}
   - Use pair discussions or small group activities
   - Surface current pain points and challenges
   - Assess team's current understanding level

2. CONCEPT (15-20 minutes): Introduce the main idea concisely
   - Present ${topic} through stories, visuals, and live coding demonstrations
   - Show concrete code examples (before/after)
   - Explain WHY this practice enhances technical excellence
   - Connect to broader principles (SOLID, DRY, YAGNI, etc.)

3. CONCRETE (20-30 minutes): Practice together through hands-on coding
   - Pairs or ensemble programming on prepared exercises
   - Focus on ONE specific micro-skill related to ${topic}
   - Provide a coding challenge that mimics real-world scenarios
   - Include clear constraints and acceptance criteria
   - Encourage test-first approach where applicable

4. CONCLUSION (5-10 minutes): Reflect and plan application
   - Share insights and "aha" moments
   - Identify one specific way to apply this in current work
   - Create commitment to practice in daily development
   - Connect learning to team's technical excellence goals

MIRO BOARD REQUIREMENTS for ${style} style:
- Visual hierarchy with clear sections for each 4C phase
- Rich sticky note content for facilitation
- Code example frames with syntax highlighting
- Interactive elements for participant engagement
- Timer indicators for each activity
- Facilitation notes for Technical Coaches

Return ONLY valid JSON:
{
  "topic": "${topic}",
  "sessionOverview": "2-3 sentences explaining what participants will practice, why it matters for technical excellence, and how it connects to daily development work",
  "learningObjectives": [
    "REMEMBER: Define key terminology and concepts related to ${topic}",
    "IDENTIFY: Recognize situations in their codebase where ${topic} applies",
    "DEMONSTRATE: Apply specific refactoring/coding techniques for ${topic}",
    "EVALUATE: Assess code quality improvements from addressing ${topic}"
  ],
  "activities": [
    {
      "title": "Connect: ${topic} in Our Codebase",
      "duration": "8 minutes",
      "description": "Pairs share real examples of ${topic} from their current projects",
      "instructions": [
        "Form pairs with someone from a different team/project",
        "Each person shares one specific example of ${topic} they've encountered recently",
        "Discuss: What made it challenging? What was the impact on development speed?",
        "Identify common patterns across your examples",
        "Prepare to share one insight with the larger group"
      ]
    },
    {
      "title": "Concept: Understanding ${topic}",
      "duration": "15 minutes",
      "description": "Live coding demonstration of ${topic} patterns and solutions",
      "instructions": [
        "Watch facilitator demonstrate problematic code exhibiting ${topic}",
        "Identify specific code smells or anti-patterns together",
        "Observe step-by-step refactoring using [specific technique]",
        "Note the testing approach used during refactoring",
        "Ask questions about edge cases and alternative approaches"
      ]
    },
    {
      "title": "Concrete: Refactoring ${topic} Exercise",
      "duration": "25 minutes",
      "description": "Hands-on practice refactoring code that exhibits ${topic}",
      "instructions": [
        "Work in pairs on the provided coding exercise",
        "Start by writing a characterization test for the existing code",
        "Identify the specific ${topic} issue in the code",
        "Apply small, safe refactoring steps (run tests after each step)",
        "Focus on [specific micro-skill] rather than perfection",
        "Rotate driver/navigator roles every 5 minutes",
        "Prepare to demonstrate one refactoring step to the group"
      ]
    },
    {
      "title": "Conclusion: Applying to Our Work",
      "duration": "7 minutes",
      "description": "Reflect on learning and commit to specific actions",
      "instructions": [
        "Share one 'aha' moment from the exercise with your pair",
        "Identify one place in your current work where you could apply this technique",
        "Write a specific commitment on a sticky note: 'This week I will...'",
        "Share commitments in groups of 4",
        "Volunteer one commitment to share with the whole group"
      ]
    }
  ],
  "discussionPrompts": [
    "Where in your current codebase would addressing ${topic} have the biggest impact?",
    "What prevents us from addressing ${topic} when we see it?",
    "How does ${topic} affect our ability to deliver value quickly and safely?",
    "What team practices could help us prevent ${topic} in new code?",
    "How might TDD help us avoid ${topic} from the start?"
  ],
  "keyTakeaways": [
    "Small, incremental refactorings are safer than big rewrites when addressing ${topic}",
    "Tests give us confidence to refactor ${topic} without breaking functionality",
    "Addressing ${topic} improves code readability, testability, and team velocity",
    "Regular practice with ${topic} patterns helps us recognize and prevent them"
  ],
  "miroContent": {
    "boardTitle": "Learning Hour: ${topic} - Deliberate Practice Session",
    "style": "${style}",
    "sections": [
      {
        "title": "Welcome & Session Overview",
        "type": "text_frame",
        "content": "Today's Learning Hour: ${topic}\\n\\n[Session overview from above]\\n\\nRemember: We're here to practice and learn together. Mistakes are valuable learning opportunities!"
      },
      {
        "title": "Learning Objectives",
        "type": "sticky_notes",
        "color": "light_blue",
        "items": ["[Each learning objective from above on separate sticky]"]
      },
      {
        "title": "CONNECT: Your Experience (8 min)",
        "type": "sticky_notes",
        "color": "light_yellow",
        "items": [
          "In pairs: Share a recent encounter with ${topic}",
          "What made it challenging?",
          "Impact on your development flow?",
          "Common patterns you notice?"
        ]
      },
      {
        "title": "CONCEPT: Live Demo (15 min)",
        "type": "text_frame",
        "content": "Watch for:\\n• Code smells indicating ${topic}\\n• Step-by-step refactoring approach\\n• How tests guide the refactoring\\n• Decision points and trade-offs"
      },
      {
        "title": "CONCRETE: Coding Exercise (25 min)",
        "type": "sticky_notes",
        "color": "light_green",
        "items": [
          "1. Write characterization test",
          "2. Identify the ${topic} issue",
          "3. Apply small refactorings",
          "4. Run tests after each change",
          "5. Rotate driver/navigator every 5 min",
          "Focus: [specific micro-skill]"
        ]
      },
      {
        "title": "Code Exercise Setup",
        "type": "code_examples",
        "language": "java",
        "beforeCode": "// Starting code with ${topic} issue\\n// [Realistic example that participants might see in their work]",
        "afterCode": "// One possible refactored solution\\n// [Clean, testable code following SOLID principles]"
      },
      {
        "title": "CONCLUSION: Apply It (7 min)",
        "type": "sticky_notes",
        "color": "light_pink",
        "items": [
          "Share your 'aha' moment",
          "Where in YOUR code will you apply this?",
          "Write commitment: 'This week I will...'",
          "Share in groups of 4"
        ]
      },
      {
        "title": "Discussion Questions",
        "type": "sticky_notes",
        "color": "light_orange",
        "items": ["[Each discussion prompt from above]"]
      },
      {
        "title": "Key Takeaways",
        "type": "sticky_notes",
        "color": "light_purple",
        "items": ["[Each takeaway from above]"]
      },
      {
        "title": "Facilitator Notes",
        "type": "text_frame",
        "content": "Tips for Technical Coaches:\\n• Emphasize practice over perfection\\n• Encourage questions during demo\\n• Circulate during pair work\\n• Time-box strictly but adjust if needed\\n• Close with energy and commitment"
      }
    ]
  }
}

Style-specific adaptations:
- slide: Optimize for screen sharing with clear visual progression through 4C phases
- vertical: Create scrollable sections with detailed instructions visible at once
- workshop: Include additional breakout activities and extended practice time`;
  }

  buildCodeExamplePrompt(topic: string, language: string): string {
    return `Create a comprehensive, production-like code example for a Learning Hour on "${topic}" in ${language}.

CONTEXT: This example will be used in the Concrete phase of a Learning Hour where participants practice refactoring through hands-on coding. The example must feel realistic and connect to actual problems developers face.

LEARNING HOUR PHILOSOPHY: We practice in a safe environment to build muscle memory for technical excellence. Small, incremental improvements with tests give us confidence to refactor production code.

REQUIREMENTS:
1. Create a REALISTIC scenario that developers would encounter in production codebases
2. Show MULTIPLE refactoring steps (3-5 steps), not just before/after
3. Include SPECIFIC code smells being addressed at each step
4. Provide TEST CODE alongside production code
5. Add FACILITATION notes for Technical Coaches
6. Demonstrate INCREMENTAL improvements - each step should be small and safe
7. Connect to broader TECHNICAL EXCELLENCE principles

IMPORTANT: Return ONLY valid JSON with no additional text or markdown formatting.

{
  "topic": "${topic}",
  "language": "${language}",
  "context": "Brief description of the realistic scenario (e.g., 'E-commerce checkout system calculating discounts and taxes')",
  "problemStatement": "What specific problem does this code exhibit that makes it a good Learning Hour example?",
  "learningHourConnection": "How does practicing with this example build skills that transfer to participants' daily work?",
  "refactoringSteps": [
    {
      "stepNumber": 1,
      "description": "Extract Method - Isolate discount calculation logic",
      "code": "// Production code for this step\\nclass OrderProcessor {\\n    // Show the code after this specific refactoring\\n}",
      "testCode": "// Test code that validates this step\\n@Test\\nvoid shouldCalculateDiscountCorrectly() {\\n    // Test implementation\\n}",
      "codeSmells": ["Long Method", "Feature Envy", "Comments explaining complex logic"],
      "improvements": ["Single Responsibility", "Improved testability", "Self-documenting code"],
      "facilitationTip": "Ask pairs: 'What makes this method easier to test now? How would you test the edge cases?'"
    },
    {
      "stepNumber": 2,
      "description": "Replace Conditional with Polymorphism - Different discount strategies",
      "code": "// Code after introducing strategy pattern\\ninterface DiscountStrategy {\\n    // etc.\\n}",
      "testCode": "// Tests for the new abstraction\\n@Test\\nvoid shouldApplyPercentageDiscount() {\\n    // Test implementation\\n}",
      "codeSmells": ["Switch statements", "Type checking", "Duplicate logic"],
      "improvements": ["Open/Closed Principle", "Strategy Pattern", "Easier to extend"],
      "facilitationTip": "Pause here and ask: 'What new discount types could we add without changing existing code?'"
    },
    {
      "stepNumber": 3,
      "description": "Introduce Parameter Object - Group related parameters",
      "code": "// Code with new parameter object\\nclass DiscountContext {\\n    // Grouped parameters\\n}",
      "testCode": "// Tests showing improved clarity\\n@Test\\nvoid shouldCreateDiscountContextWithValidData() {\\n    // Test implementation\\n}",
      "codeSmells": ["Long Parameter List", "Data Clumps", "Primitive Obsession"],
      "improvements": ["Cohesion", "Domain modeling", "Validation in one place"],
      "facilitationTip": "Discuss: 'How does grouping these parameters reveal domain concepts we were missing?'"
    }
  ],
  "additionalExercises": [
    "Add a new discount type (e.g., loyalty program) using the refactored structure",
    "Extract validation logic into a separate validator class",
    "Implement a composite pattern for combining multiple discounts"
  ],
  "facilitationNotes": {
    "timeAllocation": "5 min initial code review, 15 min pair refactoring, 5 min group discussion",
    "commonMistakes": [
      "Trying to refactor everything at once instead of small steps",
      "Forgetting to run tests between each refactoring",
      "Getting stuck on naming - encourage 'good enough' names that can be improved later"
    ],
    "discussionPoints": [
      "Which refactoring step had the biggest impact on code clarity?",
      "How do these patterns apply to your current codebase?",
      "What prevented us from writing it this way initially?"
    ],
    "pairProgrammingTips": [
      "Enforce role switching every 5 minutes using a timer",
      "Navigator should focus on the current refactoring step, not jump ahead",
      "Encourage thinking out loud to share mental models",
      "Celebrate each green test as progress"
    ]
  }
}

CRITICAL DETAILS:
- Each refactoring step must compile and pass tests independently
- Code should be substantial enough to feel real (not toy examples)
- Include ${language}-specific idioms and best practices
- Test code should demonstrate TDD thinking
- Code smells should be specific and recognizable
- Facilitation tips should encourage participant engagement
- The progression should tell a story of incremental improvement`;
  }

  async generateSessionContent(topic: string, style: string = 'slide'): Promise<SessionContent> {
    const prompt = this.buildSessionPrompt(topic, style);

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const textContent = message.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }
      const content = textContent.text;
      const sessionData = JSON.parse(content);
      this.validateSessionContent(sessionData);

      return sessionData;
    } catch (error) {
      throw new Error(`Failed to generate session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateCodeExample(topic: string, language: string = 'java'): Promise<CodeExample> {
    const prompt = this.buildCodeExamplePrompt(topic, language);

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const textContent = message.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }
      const content = textContent.text;
      console.error('Raw response:', content.substring(0, 200) + '...');
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}$/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const exampleData = JSON.parse(jsonMatch[0]);
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
    const required = ['topic', 'language', 'context', 'problemStatement', 'learningHourConnection', 'refactoringSteps', 'additionalExercises', 'facilitationNotes'];

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(data.refactoringSteps) || data.refactoringSteps.length < 2) {
      throw new Error('refactoringSteps must be an array with at least 2 steps');
    }

    data.refactoringSteps.forEach((step: any, index: number) => {
      const stepRequired = ['stepNumber', 'description', 'code', 'codeSmells', 'improvements', 'facilitationTip'];
      for (const field of stepRequired) {
        if (!step[field]) {
          throw new Error(`Refactoring step ${index} missing required field: ${field}`);
        }
      }
      if (!Array.isArray(step.codeSmells) || !Array.isArray(step.improvements)) {
        throw new Error(`Refactoring step ${index} codeSmells and improvements must be arrays`);
      }
    });

    if (!Array.isArray(data.additionalExercises)) {
      throw new Error('additionalExercises must be an array');
    }

    const notesRequired = ['timeAllocation', 'commonMistakes', 'discussionPoints', 'pairProgrammingTips'];
    for (const field of notesRequired) {
      if (!data.facilitationNotes[field]) {
        throw new Error(`facilitationNotes missing required field: ${field}`);
      }
    }
  }

}
