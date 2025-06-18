import { CodeImageGenerator } from './src/CodeImageGenerator';
import * as fs from 'fs';
import { logger } from './src/logger';

class RaysoTest {
  private generator: CodeImageGenerator;

  constructor() {
    this.generator = new CodeImageGenerator();
  }

  async testRayso(): Promise<boolean> {
    logger.info('Testing Ray.so image generation...\n');
    
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
        logger.info('✅ Image generated successfully!');
        logger.info(`   Buffer size: ${result.buffer.length} bytes`);
        logger.info(`   Dimensions: ${result.width}x${result.height}`);
        
        // Save the image to verify it works
        fs.writeFileSync('test-rayso-output.png', result.buffer);
        logger.info('   Saved as: test-rayso-output.png');
        
        return true;
      } else {
        logger.error('❌ No image generated');
        return false;
      }
    } catch (error) {
      logger.error('❌ Error:', error);
      return false;
    }
  }

  static async main(): Promise<void> {
    const tester = new RaysoTest();
    
    try {
      const success = await tester.testRayso();
      
      if (success) {
        logger.info('\n✅ Ray.so test passed!');
        process.exit(0);
      } else {
        logger.error('\n❌ Ray.so test failed!');
        process.exit(1);
      }
    } catch (error) {
      logger.error('\n❌ Unexpected error:', error);
      process.exit(1);
    }
  }
}

// Entry point
if (require.main === module) {
  RaysoTest.main();
}