# Sophisticated Miro Board Generation Prompt

## Overview
I've created a comprehensive prompt system that transforms Learning Hour content into beautiful, well-designed Miro boards that Technical Coaches can use directly without reorganization.

## Key Components of the Enhanced Prompt

### 1. Visual Design Philosophy
The prompt emphasizes:
- **4C Flow**: Clear visual progression through Connect → Concept → Concrete → Conclusion
- **Color Psychology**: Specific colors chosen for psychological impact
- **Spatial Organization**: Left-to-right flow with generous white space
- **Visual Hierarchy**: Size, color, and positioning create clear importance levels

### 2. Detailed Section Specifications
Each 4C phase includes:
- **Structured JSON-like specifications** for precise layout
- **Interactive elements** (sticky notes, timers, voting widgets)
- **Participant workspaces** for hands-on activities
- **Facilitator support** areas with checklists and notes

### 3. Board Layout Elements

#### Header Frame
```json
{
  "type": "frame",
  "title": "Learning Hour: ${topic}",
  "style": "header",
  "color": "#1E3A5F",
  "elements": ["title", "subtitle", "timer_widget"]
}
```

#### Navigation Sidebar
- Quick links to each 4C section
- Visual progress indicators
- Time allocations displayed

#### Connect Section (8 min)
- Pair discussion prompts
- Experience sharing workspace
- Empty sticky note clusters for input
- Warm colors for energy and openness

#### Concept Section (15 min)
- Live coding demo area with before/after
- Mind map of key concepts
- Questions parking lot
- Cool colors for focus

#### Concrete Section (25 min)
- Step-by-step exercise cards
- 6 pair programming workspaces
- Code exercise frames
- Facilitator dashboard
- Green colors for growth

#### Conclusion Section (7 min)
- Reflection prompt cards with emojis
- 24-slot commitment wall
- Voting widget for resonance
- Pink colors for action

### 4. Interactive Features
- **Draggable sticky notes** for real-time input
- **Timer widgets** with interval support
- **Voting mechanisms** for engagement
- **Linked navigation** between sections
- **Code blocks** with syntax highlighting

### 5. Style Adaptations
The prompt includes three style variations:
- **Slide**: Sequential presentation focus
- **Vertical**: Continuous scrolling
- **Workshop**: Maximum collaboration space

## Implementation Details

### Enhanced Miro Builder
Created `EnhancedMiroBuilder` class that:
- Implements the sophisticated layout algorithm
- Manages color schemes and spacing
- Creates all interactive elements
- Handles different board styles
- Integrates with Miro MCP tools

### Integration Points
- Uses `create_sticky_note` for participant input areas
- Uses `create_shape` for frames and containers
- Uses `create_text` for instructions and labels
- Implements proper positioning algorithms

## Benefits for Technical Coaches

1. **Zero Setup Time**: Boards are ready to use immediately
2. **Professional Design**: Consistent, beautiful layouts
3. **Clear Flow**: Visual guidance through 4C phases
4. **Time Management**: Built-in timers and pacing
5. **Engagement Tools**: Interactive elements pre-configured
6. **Flexibility**: Supports remote, hybrid, and in-person sessions

## Example Usage

When generating a Learning Hour on "Feature Envy":
1. The system creates a complete session plan
2. Generates code examples with refactoring steps
3. Creates a Miro board with:
   - Professional header and navigation
   - Color-coded 4C sections
   - Interactive workspaces for 6 pairs
   - Code demo areas with examples
   - Commitment wall for action items
   - Facilitator support tools

## Result
Technical Coaches receive a Miro board that:
- Looks professionally designed
- Follows workshop facilitation best practices
- Includes all necessary interactive elements
- Supports the Learning Hour methodology
- Requires no additional setup or reorganization