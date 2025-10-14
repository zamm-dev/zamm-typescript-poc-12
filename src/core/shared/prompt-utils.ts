import * as readline from 'readline';

/**
 * Interface for terminal prompts - can be replaced with mock for testing
 */
export interface PromptService {
  question(prompt: string): Promise<string>;
}

/**
 * Real implementation using Node.js readline
 */
class RealPromptService implements PromptService {
  async question(prompt: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question(prompt, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }
}

let promptService: PromptService = new RealPromptService();

export function getPromptService(): PromptService {
  return promptService;
}

export function setPromptService(service: PromptService): void {
  promptService = service;
}
