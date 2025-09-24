import nock from 'nock';
import * as fs from 'fs';
import * as path from 'path';

export interface NockRecording {
  scope: string;
  method: string;
  path: string;
  body?: unknown;
  status: number;
  response: unknown;
  headers?: Record<string, string>;
  reqheaders?: Record<string, string>;
  rawHeaders?: Record<string, string>;
}

export class NockRecorder {
  private recordings: NockRecording[] = [];
  private recordingsPath: string;
  private usedMockCount: number = 0;

  constructor(recordingsFileName: string) {
    this.recordingsPath = path.join(
      __dirname,
      '..',
      'nock-recordings',
      recordingsFileName
    );
  }

  startRecording(): void {
    nock.recorder.rec({
      dont_print: true,
      output_objects: true,
      enable_reqheaders_recording: true,
    });
  }

  stopRecording(): void {
    const recordings = nock.recorder.play() as NockRecording[];

    // Filter out API keys and sanitize recordings
    const sanitizedRecordings = recordings.map(recording => {
      const sanitized = { ...recording };

      // Remove API key from headers
      if (sanitized.reqheaders) {
        // Filter x-api-key header
        const apiKey = sanitized.reqheaders['x-api-key'];
        if (apiKey && typeof apiKey === 'string') {
          sanitized.reqheaders['x-api-key'] = apiKey.replace(
            /sk-[a-zA-Z0-9_-]+/g,
            'sk-FILTERED'
          );
        }

        // Filter authorization header if present
        const auth = sanitized.reqheaders.authorization;
        if (auth && typeof auth === 'string') {
          sanitized.reqheaders.authorization = auth.replace(
            /sk-[a-zA-Z0-9_-]+/g,
            'sk-FILTERED'
          );
        }
      }

      // Remove API key from any other potential locations
      if (sanitized.body && typeof sanitized.body === 'string') {
        sanitized.body = sanitized.body.replace(
          /sk-[a-zA-Z0-9_-]+/g,
          'sk-FILTERED'
        );
      }

      return sanitized;
    });

    this.recordings = sanitizedRecordings;
    this.saveRecordings();
    nock.recorder.clear();
  }

  private saveRecordings(): void {
    const recordingsDir = path.dirname(this.recordingsPath);
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }

    // Convert to JSON string and filter out all API keys
    let recordingsJson = JSON.stringify(this.recordings, null, 2);
    recordingsJson = recordingsJson.replace(
      /sk-[a-zA-Z0-9_-]+/g,
      'sk-FILTERED'
    );

    fs.writeFileSync(this.recordingsPath, recordingsJson);
  }

  loadRecordings(): NockRecording[] {
    if (fs.existsSync(this.recordingsPath)) {
      const content = fs.readFileSync(this.recordingsPath, 'utf-8');
      return JSON.parse(content) as NockRecording[];
    }
    return [];
  }

  playbackRecordings(): void {
    const recordings = this.loadRecordings();
    this.usedMockCount = 0;

    recordings.forEach(recording => {
      const scope = nock(recording.scope)
        .matchHeader('accept', 'application/json')
        .matchHeader('content-type', 'application/json')
        .matchHeader('x-api-key', 'test-api-key')
        .post(recording.path, recording.body as nock.RequestBodyMatcher)
        .reply(
          recording.status,
          recording.response as nock.Body,
          recording.rawHeaders as nock.ReplyHeaders
        );

      scope.on('replied', () => {
        this.usedMockCount++;
      });
    });
  }

  getUsedMockCount(): number {
    return this.usedMockCount;
  }

  verifyMocksUsed(): void {
    if (this.usedMockCount === 0) {
      throw new Error(
        'No nock mocks were used during test execution - tests may not be hitting the API'
      );
    }
  }

  clear(): void {
    nock.cleanAll();
    nock.recorder.clear();
  }
}
