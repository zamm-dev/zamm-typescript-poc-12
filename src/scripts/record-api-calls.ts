#!/usr/bin/env npx tsx

import { AnthropicService } from '../core/shared/anthropic-service';
import { NockRecorder } from '../__tests__/shared/nock-utils';

async function recordApiCalls(): Promise<void> {
  console.log('Starting API call recording...');

  const recorder = new NockRecorder('feat-recordings.json');
  recorder.startRecording();

  try {
    const anthropicService = new AnthropicService();

    // Record multiple different descriptions for test variety
    const descriptions = [
      'Add user authentication',
      'Some feature',
      'Complex feature',
      'Feature with prefix',
    ];

    for (const description of descriptions) {
      console.log(`Recording for: "${description}"`);

      // Record branch name suggestion
      const branchName = await anthropicService.suggestBranchName(description);
      console.log('Branch name:', branchName);

      // Record spec title suggestion
      const specTitle = await anthropicService.suggestSpecTitle(description);
      console.log('Spec title:', specTitle);
    }

    // Record alternative branch name suggestion
    console.log('Recording alternative branch name suggestion...');
    const altBranchName = await anthropicService.suggestAlternativeBranchName(
      'Add user authentication',
      'user-authentication'
    );
    console.log('Alternative branch name:', altBranchName);

    recorder.stopRecording();
    console.log('Recording complete. Saved to feat-recordings.json');
  } catch (error) {
    console.error('Error during recording:', error);
    recorder.clear();
    process.exit(1);
  }
}

recordApiCalls().catch(console.error);
