import { describe, it, expect } from 'vitest';
import { MiroIntegration } from '../src/MiroIntegration.js';

import 'dotenv/config';
import { CodeImageGenerator } from '../src/CodeImageGenerator.js';

describe('Miro', () => {

  const accessToken = process.env.MIRO_ACCESS_TOKEN || '';
  const boardId = process.env.MIRO_BOARD_ID || '';

  const miro = new MiroIntegration(accessToken);

  it.skip('should create frames', async () => {
    await miro.createFrame(boardId, 300, 500)
  });

  it.skip('should create text boxes', async () => {
    await miro.createTextBox(boardId, 'Hello World', 300, 500, 200)
  });

  it.skip('should create stick notes', async () => {
    await miro.createStickyNote(boardId, 'Hello Sticky', 320, 500, 'pink')
  });

  it('should create code blocks', async () => {
    await miro.createCodeBlock(boardId, '```java\npublic void main() {\nString message = "Hello World!";\n}\n```', 340, 500, 'java')
  });

  it.skip('should makes code image', async () => {
    const codeImageGenerator = new CodeImageGenerator();
    const result = await codeImageGenerator.generateCodeImage({
      code: 'public static String API = "api"',
      language: 'java',
      theme: 'breeze',
      background: true,
      darkMode: true,
      padding: 10,
      title: 'Hey!'
    });
    expect(result).toEqual({});

  });

  it.skip('should get board info', async () => {
    const boardInfo = await miro.getBoardInfo(boardId);

    expect(boardInfo.name).toEqual('Learning Hour Planning');
  });

  it.skip('should get list boards', async () => {
    const response = await miro.listBoards(3);

    expect(response.data).toHaveLength(3);
  });

  it.skip('should create Learning Hour Board', async () => {
    await miro.createLearningHourBoard({ sessionOverview: 'code smells', miroContent: {
      boardTitle: 'Learning Hour Planning',
        style: 'slide',
        sections: [{
        type: 'text_frame',
          title: 'Long methods',
          content: 'no more than 20 lines',
        }]
      }});
  });

  it.skip('should create frame on existing board', async () => {
    await miro.addFramesToExistingBoard(boardId, { sessionOverview: 'code smells', miroContent: {
        boardTitle: 'Learning Hour Planning',
        style: 'slide',
        sections: [{
          type: 'text_frame',
          title: 'Long methods',
          content: 'no more than 20 lines',
        },
          {
            type: 'code_block',
            title: 'God method',
            content: 'public void handle() {}',
          },
          {
            type: 'sticky_notes',
            title: 'abc',
            content: 'Hello! Sticky!',
          }]
      }});
  });
});
