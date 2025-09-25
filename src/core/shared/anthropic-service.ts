import Anthropic from '@anthropic-ai/sdk';

export class AnthropicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnthropicError';
  }
}

export class AnthropicService {
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AnthropicError(
        'ANTHROPIC_API_KEY environment variable is required'
      );
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  async suggestBranchName(description: string): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Suggest a concise git branch name (lowercase, words separated by hyphens) for this feature description: "${description}". Respond with just the branch name, no explanation.`,
        },
      ],
    });

    if (response.content[0] && response.content[0].type === 'text') {
      return response.content[0].text.trim();
    } else {
      throw new AnthropicError(
        'Failed to get branch name suggestion from Anthropic'
      );
    }
  }

  async suggestAlternativeBranchName(
    description: string,
    conflictingBranchName: string
  ): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `The branch name "${conflictingBranchName}" conflicts. Suggest a **different** git branch name (lowercase, words separated by hyphens) for: "${description}". Respond with just the branch name, no explanation. Remember, it MUST be different from "${conflictingBranchName}".`,
        },
      ],
    });

    if (response.content[0] && response.content[0].type === 'text') {
      return response.content[0].text.trim();
    } else {
      throw new AnthropicError(
        'Failed to get alternative branch name suggestion from Anthropic'
      );
    }
  }

  async suggestSpecTitle(description: string): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Create a concise H1 markdown title for a specification about: "${description}". Respond with just the title text without the # symbol.`,
        },
      ],
    });

    if (response.content[0] && response.content[0].type === 'text') {
      return response.content[0].text.trim();
    } else {
      throw new AnthropicError(
        'Failed to get spec title suggestion from Anthropic'
      );
    }
  }
}
