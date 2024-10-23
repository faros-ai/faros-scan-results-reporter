import { QueryBuilder } from 'faros-js-client';

import {
  IstanbulConverter,
  IstanbulCoverageReport,
} from '../../src/converters/istanbul';
import { Config } from '../../src/converters/common';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('my-uuid'),
}));

describe('IstanbulConverter', () => {
  let converter: IstanbulConverter;

  beforeEach(() => {
    converter = new IstanbulConverter();
  });

  it('should convert data to mutations', () => {
    const data: IstanbulCoverageReport = {
      total: {
        lines: {
          pct: 85,
        },
      },
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
      commit: 'commit-hash',
      branch: 'main',
    };

    const result = converter.convert(
      data,
      config,
      new QueryBuilder('my-origin')
    );
    expect(result).toMatchSnapshot();
  });

  it('should return empty array for invalid data', () => {
    const invalidData = {};
    const config: Config = {
      createdAt: '2024-03-28T16:20:05.474Z',
    };

    const result = converter.convert(
      invalidData as IstanbulCoverageReport,
      config,
      new QueryBuilder('my-origin')
    );
    expect(result).toEqual([]);
  });
});
