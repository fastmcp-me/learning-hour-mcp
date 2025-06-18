import { MiroIntegration } from './src/MiroIntegration';
import 'dotenv/config';
import { LearningHourGenerator } from './src/LearningHourGenerator';
import { logger } from './src/logger';

async function testCreateFrameOnExistingBoard() {
  const accessToken = process.env.MIRO_ACCESS_TOKEN || '';
  const boardId = process.env.MIRO_BOARD_ID || '';

  if (!accessToken || !boardId) {
    logger.error('Please set MIRO_ACCESS_TOKEN, MIRO_BOARD_ID environment variables');
    process.exit(1);
  }

  const miro = new MiroIntegration(accessToken);
  const generator = new LearningHourGenerator();

  try {
    logger.info('\nGenerating Learning Hour content...');

    // Generate the session content first
    const generatedContent = await generator.generateSessionContent(
      'Primitive Obsession',
      'slide'
    );

    logger.info('\nGenerated content structure:', {
      hasSessionOverview: !!generatedContent.sessionOverview,
      hasMiroContent: !!generatedContent.miroContent,
      sectionsCount: generatedContent.miroContent?.sections?.length || 0
    });


    logger.info('\nAdding frames to existing board...');
    const result = await miro.addFramesToExistingBoard(boardId, generatedContent);

    logger.info('\nSuccess! Frame layout created:');
    logger.info(`Board ID: ${result.boardId}`);
    logger.info(`View Link: ${result.viewLink || 'N/A'}`);
    logger.info(`Sections created:`);
    logger.info(`- Overview: ${result.sections.overview ? 'Created' : 'Not created'}`);
    logger.info(`- Objectives: ${result.sections.objectives.length} sticky notes`);
    logger.info(`- Activities: ${result.sections.activities.length} sticky notes`);
    logger.info(`- Discussions: ${result.sections.discussions.length} sticky notes`);
    logger.info(`- Takeaways: ${result.sections.takeaways.length} sticky notes`);

  } catch (error) {
    logger.error('\nError occurred:', error);
    process.exit(1);
  }
}

testCreateFrameOnExistingBoard()
  .then(() => {
    logger.info('\nTest completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('\nTest failed:', error);
    process.exit(1);
  });
