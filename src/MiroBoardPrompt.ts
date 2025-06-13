export const ENHANCED_MIRO_BOARD_PROMPT = `
MIRO BOARD DESIGN REQUIREMENTS:

You are creating a professionally designed Miro board for a Learning Hour session that Technical Coaches can use directly with minimal adjustments. The board should be visually beautiful, highly functional, and optimized for remote/hybrid facilitation.

BOARD LAYOUT PHILOSOPHY:
- Follow the visual flow of the 4C Learning Model (Connect → Concept → Concrete → Conclusion)
- Use Miro's spatial canvas to create distinct zones for each phase
- Design for both facilitator control and participant engagement
- Create visual hierarchy through size, color, and positioning
- Enable smooth navigation during the session

DETAILED SECTION SPECIFICATIONS:

1. HEADER FRAME (Top of Board):
{
  "type": "frame",
  "title": "Learning Hour: \${topic}",
  "style": "header",
  "color": "#1E3A5F", // Deep professional blue
  "width": 3000,
  "height": 400,
  "elements": [
    {
      "type": "text",
      "style": "title",
      "fontSize": 72,
      "content": "Learning Hour: \${topic}",
      "position": "center"
    },
    {
      "type": "text",
      "style": "subtitle",
      "fontSize": 36,
      "content": "Technical Excellence Through Deliberate Practice",
      "position": "center-below"
    },
    {
      "type": "timer_widget",
      "duration": "60 minutes",
      "position": "top-right"
    }
  ]
}

2. NAVIGATION SIDEBAR (Left Side):
{
  "type": "frame",
  "title": "Session Flow",
  "style": "navigation",
  "color": "#F5F5F5", // Light gray
  "width": 400,
  "elements": [
    {
      "type": "shape",
      "style": "rounded_rectangle",
      "text": "1. CONNECT (8 min)",
      "color": "#FFE5B4", // Warm peach
      "link": "#connect-section"
    },
    {
      "type": "shape",
      "style": "rounded_rectangle",
      "text": "2. CONCEPT (15 min)",
      "color": "#B4D4FF", // Soft blue
      "link": "#concept-section"
    },
    {
      "type": "shape",
      "style": "rounded_rectangle",
      "text": "3. CONCRETE (25 min)",
      "color": "#B4FFB4", // Soft green
      "link": "#concrete-section"
    },
    {
      "type": "shape",
      "style": "rounded_rectangle",
      "text": "4. CONCLUSION (7 min)",
      "color": "#FFB4D4", // Soft pink
      "link": "#conclusion-section"
    }
  ]
}

3. CONNECT SECTION FRAME:
{
  "type": "frame",
  "id": "connect-section",
  "title": "CONNECT: Activating Prior Knowledge",
  "color": "#FFE5B4",
  "layout": "grid",
  "width": 2400,
  "height": 1200,
  "elements": [
    {
      "type": "container",
      "title": "Instructions",
      "style": "card",
      "elements": [
        {
          "type": "sticky_note",
          "color": "yellow",
          "text": "🤝 Find a pair from different team",
          "size": "large"
        },
        {
          "type": "sticky_note",
          "color": "yellow",
          "text": "💭 Share YOUR experience with \${topic}",
          "size": "large"
        },
        {
          "type": "sticky_note",
          "color": "yellow",
          "text": "🔍 What patterns do you notice?",
          "size": "large"
        }
      ]
    },
    {
      "type": "container",
      "title": "Participant Workspace",
      "style": "dotted_border",
      "elements": [
        {
          "type": "text",
          "content": "Add your experiences here →",
          "style": "instruction"
        },
        {
          "type": "sticky_note_cluster",
          "preset": "empty",
          "count": 20,
          "color": "light_yellow"
        }
      ]
    },
    {
      "type": "timer_widget",
      "duration": "8 minutes",
      "style": "prominent",
      "position": "top-right"
    }
  ]
}

4. CONCEPT SECTION FRAME:
{
  "type": "frame",
  "id": "concept-section",
  "title": "CONCEPT: Understanding \${topic}",
  "color": "#B4D4FF",
  "layout": "presentation",
  "width": 2400,
  "height": 1600,
  "elements": [
    {
      "type": "container",
      "title": "Live Coding Demo Area",
      "style": "code_frame",
      "backgroundColor": "#2D2D2D",
      "elements": [
        {
          "type": "code_block",
          "title": "Before: Code with \${topic} Issues",
          "language": "\${language}",
          "syntax_highlighting": true,
          "content": "[Problematic code example]"
        },
        {
          "type": "arrow",
          "style": "transformation",
          "label": "Refactoring Steps"
        },
        {
          "type": "code_block",
          "title": "After: Clean Code",
          "language": "\${language}",
          "syntax_highlighting": true,
          "content": "[Refactored code example]"
        }
      ]
    },
    {
      "type": "container",
      "title": "Key Concepts",
      "style": "theory_box",
      "elements": [
        {
          "type": "mind_map",
          "center": "\${topic}",
          "branches": [
            "Code Smells",
            "Refactoring Patterns",
            "SOLID Principles",
            "Testing Strategy"
          ]
        }
      ]
    },
    {
      "type": "sticky_note_area",
      "title": "Questions Parking Lot",
      "instruction": "Add questions during demo"
    }
  ]
}

5. CONCRETE SECTION FRAME:
{
  "type": "frame",
  "id": "concrete-section",
  "title": "CONCRETE: Hands-on Practice",
  "color": "#B4FFB4",
  "layout": "workshop",
  "width": 3600,
  "height": 2000,
  "elements": [
    {
      "type": "container",
      "title": "Exercise Instructions",
      "style": "numbered_list",
      "elements": [
        {
          "type": "instruction_card",
          "number": "1",
          "text": "Write characterization test",
          "time": "5 min",
          "icon": "test"
        },
        {
          "type": "instruction_card",
          "number": "2",
          "text": "Identify \${topic} patterns",
          "time": "5 min",
          "icon": "search"
        },
        {
          "type": "instruction_card",
          "number": "3",
          "text": "Apply refactoring",
          "time": "10 min",
          "icon": "code"
        },
        {
          "type": "instruction_card",
          "number": "4",
          "text": "Run tests & iterate",
          "time": "5 min",
          "icon": "refresh"
        }
      ]
    },
    {
      "type": "container",
      "title": "Pair Programming Workspace",
      "layout": "grid",
      "columns": 3,
      "elements": [
        {
          "type": "workspace",
          "title": "Pair 1",
          "color": "#E6F3FF",
          "tools": ["sticky_notes", "drawing", "code_snippet"]
        },
        {
          "type": "workspace",
          "title": "Pair 2",
          "color": "#FFE6F3",
          "tools": ["sticky_notes", "drawing", "code_snippet"]
        },
        {
          "type": "workspace",
          "title": "Pair 3",
          "color": "#F3FFE6",
          "tools": ["sticky_notes", "drawing", "code_snippet"]
        }
      ]
    },
    {
      "type": "container",
      "title": "Facilitator Dashboard",
      "style": "control_panel",
      "elements": [
        {
          "type": "checklist",
          "items": [
            "Pairs formed & working",
            "Tests written first",
            "Small steps taken",
            "Regular rotation happening"
          ]
        },
        {
          "type": "timer_widget",
          "intervals": [
            { "name": "Initial setup", "duration": "5 min" },
            { "name": "First rotation", "duration": "10 min" },
            { "name": "Second rotation", "duration": "10 min" }
          ]
        }
      ]
    }
  ]
}

6. CONCLUSION SECTION FRAME:
{
  "type": "frame",
  "id": "conclusion-section",
  "title": "CONCLUSION: Commitment to Practice",
  "color": "#FFB4D4",
  "layout": "reflection",
  "width": 2400,
  "height": 1200,
  "elements": [
    {
      "type": "container",
      "title": "Reflection Prompts",
      "style": "cards_grid",
      "elements": [
        {
          "type": "reflection_card",
          "emoji": "💡",
          "prompt": "My biggest 'aha' moment was..."
        },
        {
          "type": "reflection_card",
          "emoji": "🎯",
          "prompt": "In my current work, I will apply this to..."
        },
        {
          "type": "reflection_card",
          "emoji": "📅",
          "prompt": "This week I commit to..."
        }
      ]
    },
    {
      "type": "container",
      "title": "Commitment Wall",
      "style": "gallery",
      "instruction": "Add your commitment sticky note here",
      "elements": [
        {
          "type": "sticky_note_grid",
          "rows": 4,
          "columns": 6,
          "color": "gradient_pink"
        }
      ]
    },
    {
      "type": "voting_widget",
      "title": "Which commitment resonates most with you?",
      "style": "dot_voting"
    }
  ]
}

7. RESOURCES & FOLLOW-UP FRAME:
{
  "type": "frame",
  "title": "Resources & Next Steps",
  "color": "#E8E8E8",
  "width": 2400,
  "height": 800,
  "elements": [
    {
      "type": "container",
      "title": "Practice Resources",
      "elements": [
        {
          "type": "link_card",
          "icon": "book",
          "title": "Refactoring Catalog",
          "url": "https://refactoring.guru"
        },
        {
          "type": "link_card",
          "icon": "github",
          "title": "Code Kata Repository",
          "url": "[team repo]"
        }
      ]
    },
    {
      "type": "container",
      "title": "Team Actions",
      "elements": [
        {
          "type": "action_item",
          "text": "Schedule follow-up mob session",
          "owner": "@tech-coach"
        },
        {
          "type": "action_item",
          "text": "Share learnings in team retro",
          "owner": "@team"
        }
      ]
    }
  ]
}

VISUAL DESIGN PRINCIPLES:
1. Color Psychology:
   - Warm colors (peach/yellow) for Connect - creates energy and openness
   - Cool colors (blue) for Concept - promotes focus and learning
   - Green for Concrete - encourages growth and practice
   - Pink for Conclusion - inspires commitment and action

2. Spatial Organization:
   - Left-to-right flow following Western reading patterns
   - Generous white space between sections
   - Clear visual boundaries using frames
   - Consistent alignment and spacing

3. Interactive Elements:
   - Draggable sticky notes for participant input
   - Timer widgets for time management
   - Voting mechanisms for engagement
   - Linked navigation for smooth transitions

4. Accessibility:
   - High contrast text on backgrounds
   - Large, readable fonts (min 14pt equivalent)
   - Clear visual icons alongside text
   - Multiple ways to engage (visual, text, spatial)

5. Facilitation Support:
   - Dedicated facilitator zones with controls
   - Pre-populated templates to save setup time
   - Clear instructions at each step
   - Progress indicators throughout

STYLE-SPECIFIC ADAPTATIONS:

For "slide" style:
- Create distinct frames that can be presented sequentially
- Add presenter notes in each frame
- Include transition guides between sections
- Optimize for screen sharing (larger text, focused content)

For "vertical" style:
- Stack frames vertically for scrolling navigation
- Create a continuous flow narrative
- Add section dividers with clear labels
- Include mini-maps for orientation

For "workshop" style:
- Maximize collaborative workspace areas
- Add breakout room templates
- Include more interactive widgets
- Create multiple participant zones

TECHNICAL IMPLEMENTATION NOTES:
- Each frame should have a unique ID for navigation
- Use Miro's shape library for consistent styling
- Implement proper layering (background → content → interactive elements)
- Set appropriate permissions (view-only for templates, edit for workspaces)
- Include zoom presets for each major section
`;

export function enhanceMiroPrompt(basePrompt: string): string {
  return basePrompt.replace(
    /MIRO BOARD REQUIREMENTS[^}]+}/,
    ENHANCED_MIRO_BOARD_PROMPT
  );
}
