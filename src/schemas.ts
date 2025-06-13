import Ajv from 'ajv';

const ajv = new Ajv();

export const sessionContentSchema = {
  type: "object",
  properties: {
    topic: { type: "string", minLength: 1 },
    sessionOverview: { type: "string", minLength: 10 },
    learningObjectives: {
      type: "array",
      minItems: 3,
      items: { type: "string", minLength: 10 }
    },
    activities: {
      type: "array",
      minItems: 2,
      items: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1 },
          duration: { type: "string", minLength: 1 },
          description: { type: "string", minLength: 10 },
          instructions: {
            type: "array",
            minItems: 1,
            items: { type: "string", minLength: 1 }
          }
        },
        required: ["title", "duration", "description", "instructions"],
        additionalProperties: false
      }
    },
    discussionPrompts: {
      type: "array",
      minItems: 4,
      items: { type: "string", minLength: 5 }
    },
    keyTakeaways: {
      type: "array",
      minItems: 3,
      items: { type: "string", minLength: 5 }
    },
    miroContent: {
      type: "object",
      properties: {
        boardTitle: { type: "string", minLength: 1 },
        style: { type: "string" },
        sections: {
          type: "array",
          minItems: 3,
          items: {
            type: "object",
            properties: {
              title: { type: "string", minLength: 1 },
              type: { 
                type: "string", 
                enum: ["text_frame", "sticky_notes", "code_examples", "timer"] 
              },
              content: { type: "string" },
              color: { type: "string" },
              items: {
                type: "array",
                items: { type: "string" }
              },
              language: { type: "string" },
              beforeCode: { type: "string" },
              afterCode: { type: "string" },
              durations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    activity: { type: "string" },
                    minutes: { type: "number" }
                  },
                  required: ["activity", "minutes"]
                }
              }
            },
            required: ["title", "type"],
            additionalProperties: false
          }
        }
      },
      required: ["boardTitle", "sections", "style"],
      additionalProperties: false
    }
  },
  required: ["topic", "sessionOverview", "learningObjectives", "activities", "discussionPrompts", "keyTakeaways", "miroContent"],
  additionalProperties: false
};

export const codeExampleSchema = {
  type: "object",
  properties: {
    topic: { type: "string", minLength: 1 },
    language: { type: "string", minLength: 1 },
    context: { type: "string", minLength: 10 },
    problemStatement: { type: "string", minLength: 10 },
    learningHourConnection: { type: "string", minLength: 10 },
    refactoringSteps: {
      type: "array",
      minItems: 2,
      items: {
        type: "object",
        properties: {
          stepNumber: { type: "number", minimum: 1 },
          description: { type: "string", minLength: 5 },
          code: { type: "string", minLength: 10 },
          testCode: { type: "string", minLength: 10 },
          codeSmells: {
            type: "array",
            minItems: 1,
            items: { type: "string", minLength: 3 }
          },
          improvements: {
            type: "array",
            minItems: 1,
            items: { type: "string", minLength: 3 }
          },
          facilitationTip: { type: "string", minLength: 10 }
        },
        required: ["stepNumber", "description", "code", "codeSmells", "improvements", "facilitationTip"],
        additionalProperties: false
      }
    },
    additionalExercises: {
      type: "array",
      minItems: 1,
      items: { type: "string", minLength: 10 }
    },
    facilitationNotes: {
      type: "object",
      properties: {
        timeAllocation: { type: "string", minLength: 5 },
        commonMistakes: {
          type: "array",
          minItems: 1,
          items: { type: "string", minLength: 10 }
        },
        discussionPoints: {
          type: "array",
          minItems: 1,
          items: { type: "string", minLength: 10 }
        },
        pairProgrammingTips: {
          type: "array",
          minItems: 1,
          items: { type: "string", minLength: 10 }
        }
      },
      required: ["timeAllocation", "commonMistakes", "discussionPoints", "pairProgrammingTips"],
      additionalProperties: false
    }
  },
  required: ["topic", "language", "context", "problemStatement", "learningHourConnection", "refactoringSteps", "additionalExercises", "facilitationNotes"],
  additionalProperties: false
};

export const validateSessionContent = ajv.compile(sessionContentSchema);
export const validateCodeExample = ajv.compile(codeExampleSchema);