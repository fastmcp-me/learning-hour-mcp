import { MiroIntegration } from './src/MiroIntegration';
import 'dotenv/config';
import { LearningHourGenerator } from './src/LearningHourGenerator';

async function testCreateFrameOnExistingBoard() {
  const accessToken = process.env.MIRO_ACCESS_TOKEN || '';
  const boardId = process.env.MIRO_BOARD_ID || '';

  if (!accessToken || !boardId) {
    console.error('Please set MIRO_ACCESS_TOKEN, MIRO_BOARD_ID environment variables');
    process.exit(1);
  }

  const miro = new MiroIntegration(accessToken);
  const generator = new LearningHourGenerator();

  try {
    console.log('\nGenerating Learning Hour content...');

    // Generate the session content first
    const generatedContent = await generator.generateSessionContent(
      'Primitive Obsession',
      'slide'
    );

    console.log('\nGenerated content structure:', {
      hasSessionOverview: !!generatedContent.sessionOverview,
      hasMiroContent: !!generatedContent.miroContent,
      sectionsCount: generatedContent.miroContent?.sections?.length || 0
    });


    console.log('\nAdding frames to existing board...');
    const result = await miro.addFramesToExistingBoard(boardId, generatedContent);

    console.log('\nSuccess! Frame layout created:');
    console.log(`Board ID: ${result.boardId}`);
    console.log(`View Link: ${result.viewLink || 'N/A'}`);
    console.log(`Sections created:`);
    console.log(`- Overview: ${result.sections.overview ? 'Created' : 'Not created'}`);
    console.log(`- Objectives: ${result.sections.objectives.length} sticky notes`);
    console.log(`- Activities: ${result.sections.activities.length} sticky notes`);
    console.log(`- Discussions: ${result.sections.discussions.length} sticky notes`);
    console.log(`- Takeaways: ${result.sections.takeaways.length} sticky notes`);

  } catch (error) {
    console.error('\nError occurred:', error);
    process.exit(1);
  }
}

testCreateFrameOnExistingBoard()
  .then(() => {
    console.log('\nTest completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nTest failed:', error);
    process.exit(1);
  });
