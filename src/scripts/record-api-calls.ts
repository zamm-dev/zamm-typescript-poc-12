#!/usr/bin/env npx tsx

import { RealAnthropicService } from '../core/shared/anthropic-service';
import { NockRecorder } from '../__tests__/shared/nock-utils';
import * as fs from 'fs';
import * as path from 'path';

const FIXTURE_DIR = path.resolve(__dirname, '../__tests__/fixtures/anthropic');

const IMPLEMENTATION_DOC_PATH = path.join(FIXTURE_DIR, 'worktree-commands.md');

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
      branchName
    );
    console.log('Alternative branch name:', altBranchName);

    const implementationDoc = fs.readFileSync(IMPLEMENTATION_DOC_PATH, 'utf8');

    const setupCommands =
      await anthropicService.generateWorktreeSetupCommands(implementationDoc);
    console.log('Setup commands:', setupCommands);

    const buildCommands =
      await anthropicService.generateWorktreeBuildCommands(implementationDoc);
    console.log('Post-worktree commands:', buildCommands);

    recorder.stopRecording();
    console.log('Recording complete. Saved to feat-recordings.json');
  } catch (error) {
    console.error('Error during recording:', error);
    recorder.clear();
    process.exit(1);
  }
}

recordApiCalls().catch(console.error);
