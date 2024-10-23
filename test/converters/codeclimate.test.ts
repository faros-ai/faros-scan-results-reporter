import { QueryBuilder } from 'faros-js-client';

import {
  CodeClimateConverter,
  CodeCoverageReport,
} from '../../src/converters/codeclimate';
import { Config } from '../../src/converters/common';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('my-uuid'),
}));

describe('CodeClimateConverter', () => {
  let converter: CodeClimateConverter;

  beforeEach(() => {
    converter = new CodeClimateConverter();
  });

  it('should convert data to mutations', () => {
    const data: CodeCoverageReport = {
      git: {
        head: 'commit-hash',
        committed_at: 1616947205,
      },
      covered_percent: 80,
    };

    const config: Config = {
      createdAt: '2024-03-28T16:20:05.474Z',
      repoInfo: {
        name: 'repo-name',
        organization: 'org-name',
        source: 'source-name',
      },
      pullRequest: 123,
      appInfo: {
        name: 'app-name',
        platform: 'platform-name',
      },
    };

    const result = converter.convert(
      data,
      config,
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });
});
