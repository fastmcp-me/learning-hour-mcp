export class ContentPostProcessor {
  processSessionContent(content: any): any {
    // Deep clone to avoid mutating original
    const processed = JSON.parse(JSON.stringify(content));
    
    // Process miroContent sections if they exist
    if (processed.miroContent?.sections) {
      processed.miroContent.sections = processed.miroContent.sections.map((section: any) => {
        return this.processSection(section, processed);
      });
    }
    
    return processed;
  }
  
  private processSection(section: any, fullContent: any): any {
    // Replace placeholder content in text_frame sections
    if (section.type === 'text_frame' && section.content) {
      section.content = this.replacePlaceholders(section.content, fullContent);
    }
    
    // Replace placeholder items in sticky_notes sections
    if (section.type === 'sticky_notes' && section.items) {
      section.items = section.items.filter((item: string) => {
        // Remove items that are just placeholders
        return !item.includes('[Each') && !item.includes('[specific');
      }).map((item: string) => {
        return this.replacePlaceholders(item, fullContent);
      });
      
      // If all items were placeholders, provide default content
      if (section.items.length === 0) {
        section.items = this.getDefaultItems(section.title);
      }
    }
    
    // Replace placeholder code in code_examples sections
    if (section.type === 'code_examples') {
      if (section.beforeCode?.includes('[Realistic example')) {
        section.beforeCode = this.getDefaultBeforeCode(fullContent.topic);
      }
      if (section.afterCode?.includes('[Clean, testable code')) {
        section.afterCode = this.getDefaultAfterCode(fullContent.topic);
      }
    }
    
    return section;
  }
  
  private replacePlaceholders(text: string, fullContent: any): string {
    // Replace [Session overview from above]
    if (text.includes('[Session overview from above]') && fullContent.sessionOverview) {
      text = text.replace('[Session overview from above]', fullContent.sessionOverview);
    }
    
    // Replace ${topic} with actual topic
    if (fullContent.topic) {
      text = text.replace(/\${topic}/g, fullContent.topic);
    }
    
    return text;
  }
  
  private getDefaultItems(sectionTitle: string): string[] {
    const defaults: Record<string, string[]> = {
      'Learning Objectives': [
        'Understand the key concepts',
        'Practice applying the technique',
        'Gain confidence through hands-on exercise'
      ],
      'Discussion Questions': [
        'What was most challenging?',
        'How might you apply this in your work?',
        'What questions do you still have?'
      ],
      'Key Takeaways': [
        'Small, incremental changes are safer',
        'Tests provide confidence when refactoring',
        'Practice makes these techniques second nature'
      ]
    };
    
    return defaults[sectionTitle] || ['Item 1', 'Item 2', 'Item 3'];
  }
  
  private getDefaultBeforeCode(topic: string): string {
    return `// Example code demonstrating ${topic || 'the concept'}
public class Example {
    // This method shows common issues
    public void process(String data) {
        // Implementation here
    }
}`;
  }
  
  private getDefaultAfterCode(topic: string): string {
    return `// Refactored code addressing ${topic || 'the issue'}
public class Example {
    // Improved implementation
    public void process(String data) {
        // Cleaner implementation
    }
}`;
  }
}