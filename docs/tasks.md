# Tasks: LLM-Powered Miro Board Generation

## Current State
The Miro board generation creates boards but has several issues:
- Text content not visible in frames
- Poor visual hierarchy
- Rigid, rule-based layout that doesn't adapt to content
- No visual flow or learning progression indicators
- Large frames with small content (wasted space)

## Quick Fixes (Do First)

### 1. Fix Text Visibility Issue
- [x] Investigate why text content isn't showing in frames
- [x] Check if frames need text elements as children (not separate)
- [x] Verify the relationship between frames and text elements
- [x] Test with simple text content first

### 2. Fix Frame Sizing
- [x] Remove hardcoded 800x800 frame sizes
- [x] Calculate frame size based on content length
- [x] Add proper padding around content
- [x] Ensure minimum readable sizes

### 3. Improve Text Hierarchy
- [x] Make section titles larger (24-32pt)
- [x] Make body text readable (14-16pt)
- [x] Add font weight variations
- [ ] Use color to differentiate text types

### 4. Fix Content Association
- [x] Ensure section.content is being used properly
- [x] Add content to text_frame sections
- [x] Display learning objectives, activities, etc. properly

## Phase 1: MiroBoardDesigner Foundation

### Create Core Designer Class
```typescript
// src/MiroBoardDesigner.ts
class MiroBoardDesigner {
    constructor(
        private llm: Anthropic,
        private miro: MiroIntegration
    ) {}
    
    async analyzeContent(content: SessionContent): DesignPlan
    async generateLayout(plan: DesignPlan): LayoutSpecification
    async implementLayout(spec: LayoutSpecification): MiroBoard
}
```

### Tasks:
- [ ] Create MiroBoardDesigner class structure
- [ ] Define DesignPlan and LayoutSpecification interfaces
- [ ] Create prompt templates for layout generation
- [ ] Implement content analysis method
- [ ] Add size calculation based on content

## Phase 2: Convert to MCP Tools (2-3 days)

### Create Granular Miro Tools
- [ ] `miro_analyze_board` - Get existing elements and space
- [ ] `miro_create_styled_text` - Text with smart styling
- [ ] `miro_create_content_frame` - Frame that fits content
- [ ] `miro_create_code_showcase` - Beautiful code display
- [ ] `miro_create_sticky_cluster` - Grouped sticky notes
- [ ] `miro_create_flow_connector` - Visual flow arrows
- [ ] `miro_find_optimal_position` - Smart positioning

### Layout Helper Tools
- [ ] `calculate_content_dimensions` - Estimate space needs
- [ ] `find_empty_zone` - Locate available space
- [ ] `create_visual_group` - Group related elements
- [ ] `apply_design_theme` - Consistent styling

## Phase 3: Design Intelligence (2-3 days)

### Create Design System Prompts
- [ ] Learning Hour 4C color scheme:
    - Connect: Warm Yellow (#FFD93D)
    - Concept: Cool Blue (#6C63FF)
    - Concrete: Action Green (#6BCF7F)
    - Conclusion: Reflection Purple (#B491C8)

- [ ] Typography system:
    - Phase titles: 36pt bold
    - Section headers: 24pt semi-bold
    - Body text: 16pt regular
    - Code: 14pt monospace

- [ ] Spacing rules:
    - Between phases: 200px
    - Between sections: 100px
    - Content padding: 40px
    - Element margins: 20px

### Layout Strategies
- [ ] Workshop Flow Layout (linear with time markers)
- [ ] Canvas Layout (zones for each phase)
- [ ] Journey Map Layout (path through learning)
- [ ] Flexible Grid (responsive to content)

## Phase 4: Smart Content Adaptation (1-2 days)

### Content Analysis
- [ ] Long text detection → break into chunks
- [ ] Code length analysis → adjust display size
- [ ] List detection → choose grid vs column
- [ ] Relationship detection → add connectors

### Dynamic Sizing
```typescript
interface ContentSizer {
    calculateTextBox(text: string, maxWidth: number): Dimensions
    calculateCodeBlock(code: string, language: string): Dimensions
    calculateStickyGrid(items: string[]): GridDimensions
    calculateFrameWithPadding(content: Dimensions): Dimensions
}
```

## Example: Better Board Generation

### Current (Broken):
```typescript
// Fixed positioning, no adaptation
await this.createFrame(boardId, slideX, slideY - 250, 800, 800);
await this.createTextBox(boardId, section.title, slideX - 50, slideY - 300, 800, '#ffffff');
```

### New (Intelligent):
```typescript
const designer = new MiroBoardDesigner(anthropic, miroIntegration);

// Analyze all content first
const designPlan = await designer.analyzeContent(sessionContent);

// Generate optimal layout
const layout = await designer.generateLayout(designPlan);

// Implement with proper styling
for (const element of layout.elements) {
    await designer.createElement({
        type: element.type,
        content: element.content,
        position: element.calculatedPosition,
        size: element.adaptiveSize,
        style: element.visualStyle,
        connections: element.relatedElements
    });
}
```

## Success Metrics
- [ ] All text content is visible and readable
- [ ] Visual hierarchy guides the eye
- [ ] 4C model phases are clearly distinguished
- [ ] Code examples are properly formatted
- [ ] Board looks professional and workshop-ready
- [ ] Layout adapts to different content lengths
- [ ] Visual flow shows learning progression

## Next Actions
1. Start with quick fixes to make current implementation work
2. Build MiroBoardDesigner as a wrapper around MiroIntegration
3. Create prompts that understand visual design
4. Test with real Learning Hour content
5. Iterate based on visual results