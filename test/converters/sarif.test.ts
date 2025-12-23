import { QueryBuilder } from 'faros-js-client';

import { Config } from '../../src/converters/common';
import { SarifConverter, SarifOutput } from '../../src/converters/sarif';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('my-uuid'),
}));

describe('SarifConverter', () => {
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

  let converter: SarifConverter;

  beforeEach(() => {
    converter = new SarifConverter();
  });

  it('should convert data to mutations', () => {
    const data: SarifOutput = {
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'docker scout',
              rules: [
                {
                  id: 'CVE-2024-58251',
                  name: 'OsPackageVulnerability',
                },
              ],
            },
          },
          results: [
            {
              ruleId: 'CVE-2024-58251',
              ruleIndex: 0,
              kind: 'fail',
              level: 'note',
              message: { text: 'Vulnerability found' },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: { uri: '/lib/apk/db/installed' },
                  },
                },
              ],
            },
            {
              ruleId: 'CVE-2025-46394',
              ruleIndex: 1,
              kind: 'fail',
              level: 'warning',
              message: { text: 'Another vulnerability' },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: { uri: '/bin/busybox' },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const result = converter.convert(
      data,
      config,
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });

  it('should convert data without optional fields', () => {
    const data: SarifOutput = {
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'scanner',
              rules: [],
            },
          },
          results: [
            {
              ruleId: 'CVE-123',
              ruleIndex: 0,
              kind: 'fail',
              level: 'error',
              message: { text: 'Critical vulnerability' },
              locations: [],
            },
          ],
        },
      ],
    };

    const minimalConfig: Config = {
      createdAt: '2024-03-28T16:20:05.474Z',
    };

    const result = converter.convert(
      data,
      minimalConfig,
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });

  it('should handle empty runs', () => {
    const data: SarifOutput = {
      version: '2.1.0',
      runs: [],
    };

    const result = converter.convert(
      data,
      config,
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });

  it('should handle empty results', () => {
    const data: SarifOutput = {
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'scanner',
              rules: [],
            },
          },
          results: [],
        },
      ],
    };

    const result = converter.convert(
      data,
      config,
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });

  it('should count vulnerabilities from multiple runs', () => {
    const data: SarifOutput = {
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'scanner1',
              rules: [],
            },
          },
          results: [
            {
              ruleId: 'CVE-1',
              ruleIndex: 0,
              kind: 'fail',
              level: 'note',
              message: { text: 'Vuln 1' },
              locations: [],
            },
          ],
        },
        {
          tool: {
            driver: {
              name: 'scanner2',
              rules: [],
            },
          },
          results: [
            {
              ruleId: 'CVE-2',
              ruleIndex: 0,
              kind: 'fail',
              level: 'warning',
              message: { text: 'Vuln 2' },
              locations: [],
            },
            {
              ruleId: 'CVE-3',
              ruleIndex: 1,
              kind: 'fail',
              level: 'error',
              message: { text: 'Vuln 3' },
              locations: [],
            },
          ],
        },
      ],
    };

    const result = converter.convert(
      data,
      config,
      new QueryBuilder('my-origin'),
    );
    expect(result).toMatchSnapshot();
  });
});

