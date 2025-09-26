#!/usr/bin/env npx tsx

import { RealAnthropicService } from '../core/shared/anthropic-service';
import { NockRecorder } from '../__tests__/shared/nock-utils';

async function recordApiCalls(): Promise<void> {
  console.log('Starting API call recording...');

  const recorder = new NockRecorder('feat-recordings.json');
  recorder.startRecording();

  try {
    const anthropicService = new RealAnthropicService();

    const branchName = await anthropicService.suggestBranchName(
      'Add user authentication'
    );
    console.log('Branch name:', branchName);
    const specTitle = await anthropicService.suggestSpecTitle(
      'Add user authentication'
    );
    console.log('Spec title:', specTitle);
    const altBranchName = await anthropicService.suggestAlternativeBranchName(
      'Add user authentication',
      'zamm/user-authentication'
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
