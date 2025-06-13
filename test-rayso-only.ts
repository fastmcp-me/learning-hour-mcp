import { CodeImageGenerator } from './src/CodeImageGenerator';
import * as fs from 'fs';

class RaysoTest {
  private generator: CodeImageGenerator;

  constructor() {
    this.generator = new CodeImageGenerator();
  }

  async testRayso(): Promise<boolean> {
    console.log('Testing Ray.so image generation...\n');
    
    try {
      const result = await this.generator.generateCodeImage({
        code: `public void hello() {
    System.out.println("Hello World!");
}`,
        language: 'java',
        theme: 'midnight',
        darkMode: true,
        padding: 32,
        title: 'Simple Test'
      });

      if (result && result.buffer) {
        console.log('✅ Image generated successfully!');
        console.log(`   Buffer size: ${result.buffer.length} bytes`);
        console.log(`   Dimensions: ${result.width}x${result.height}`);
        
        // Save the image to verify it works
        fs.writeFileSync('test-rayso-output.png', result.buffer);
        console.log('   Saved as: test-rayso-output.png');
        
        return true;
      } else {
        console.log('❌ No image generated');
        return false;
      }
    } catch (error) {
      console.error('❌ Error:', error);
      return false;
    }
  }

  static async main(): Promise<void> {
    const tester = new RaysoTest();
    
    try {
      const success = await tester.testRayso();
      
      if (success) {
        console.log('\n✅ Ray.so test passed!');
        process.exit(0);
      } else {
        console.log('\n❌ Ray.so test failed!');
        process.exit(1);
      }
    } catch (error) {
      console.error('\n❌ Unexpected error:', error);
      process.exit(1);
    }
  }
}

// Entry point
if (require.main === module) {
  RaysoTest.main();
}