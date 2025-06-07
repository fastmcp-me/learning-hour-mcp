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
        sections: {
          type: "array",
          minItems: 5,
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              title: { type: "string", minLength: 1 },
              type: { 
                type: "string", 
                enum: ["text_frame", "sticky_notes"] 
              },
              content: { type: "string" },
              color: { type: "string" },
              items: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["title", "type"],
            additionalProperties: false
          }
        }
      },
      required: ["boardTitle", "sections"],
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
    beforeCode: { type: "string", minLength: 10 },
    afterCode: { type: "string", minLength: 10 },
    problemExplanation: { type: "string", minLength: 10 },
    solutionExplanation: { type: "string", minLength: 10 },
    additionalOpportunities: {
      type: "array",
      minItems: 1,
      items: { type: "string", minLength: 5 }
    }
  },
  required: ["topic", "language", "beforeCode", "afterCode", "problemExplanation", "solutionExplanation", "additionalOpportunities"],
  additionalProperties: false
};

export const validateSessionContent = ajv.compile(sessionContentSchema);
export const validateCodeExample = ajv.compile(codeExampleSchema);