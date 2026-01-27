import { QueryBuilder } from 'faros-js-client';

import {
  CoberturaConverter,
  CoberturaReport,
} from '../../src/converters/cobertura';
import { Config } from '../../src/converters/common';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('my-uuid'),
}));

describe('CoberturaConverter', () => {
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
  const data: CoberturaReport = {
    coverage: {
      $: {
        'line-rate': '0.85',
        'lines-covered': '850',
        'lines-valid': '1000',
        timestamp: '1711641605',
      },
    },
  };
  let converter: CoberturaConverter;

  beforeEach(() => {
    converter = new CoberturaConverter();
  });

  it('should convert data to mutations', () => {
    const result = converter.convert(
      data,
      config,
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });

  it('should use timestamp from report as createdAt', () => {
    const result = converter.convert(
      data,
      { ...config, createdAt: '2020-01-01T00:00:00.000Z' },
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });

  it('should fall back to config createdAt when no timestamp', () => {
    const dataNoTimestamp: CoberturaReport = {
      coverage: {
        $: {
          'line-rate': '0.85',
          'lines-covered': '850',
          'lines-valid': '1000',
          timestamp: undefined,
        },
      },
    };
    const result = converter.convert(
      dataNoTimestamp,
      config,
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });

  it('should convert data to mutations without commit', () => {
    const result = converter.convert(
      data,
      { ...config, commit: undefined },
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });

  it('should convert data to mutations without branch', () => {
    const result = converter.convert(
      data,
      { ...config, branch: undefined },
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });

  it('should return empty array for invalid data', () => {
    const invalidData = {};
    const minConfig: Config = {
      createdAt: '2024-03-28T16:20:05.474Z',
    };

    const result = converter.convert(
      invalidData as CoberturaReport,
      minConfig,
      new QueryBuilder('my-origin'),
    );
    expect(result).toEqual([]);
  });
});
