import { Mutation, QueryBuilder } from 'faros-js-client';
import { v4 } from 'uuid';

import { Converter } from '../converter';
import { CodeQualityCategory, CodeQualityMetricType } from '../types';
import { Config } from './common';

interface CodeLocation {
  readonly col: number;
  readonly line: number;
  readonly offset: number;
}

interface CodeSpan {
  readonly end: CodeLocation;
  readonly file: string;
  readonly start: CodeLocation;
}

interface ScanError {
  readonly code: number;
  readonly level: string;
  readonly message: string;
  readonly path: string;
  readonly spans: CodeSpan;
}

enum ScanResultCategory {
  Security = 'security',
}

interface ScanResultExtraMetadata {
  readonly category: string;
  readonly confidence: string;
  readonly cwe: Array<string>;
  readonly 'cwe2022-top25': boolean;
  readonly impact: string;
  readonly vulnerability_class: Array<string>;
}

interface ScanResultExtra {
  readonly engine_kind: string;
  readonly fingerprint: string;
  readonly is_ignored: boolean;
  readonly lines: string;
  readonly message: string;
  readonly metadata: ScanResultExtraMetadata;
  readonly severity: string;
}

interface ScanResult {
  readonly check_id: string;
  readonly start: CodeLocation;
  readonly end: CodeLocation;
  readonly extra: ScanResultExtra;
  readonly path: string;
}

interface SemgrepScanOutput {
  readonly errors: Array<ScanError>;
  readonly paths: {
    readonly scanned: Array<string>;
  };
  readonly results: Array<ScanResult>;
}

export class SemgrepConverter extends Converter {
  convert(
    data: SemgrepScanOutput,
    config: Config,
    qb: QueryBuilder,
  ): Array<Mutation> {
    const mutations = [];

    const qa_CodeQuality: any = {
      uid: v4(),
      vulnerabilities: {
        category: CodeQualityCategory.Security,
        type: CodeQualityMetricType.Int,
        name: 'vulnerabilities',
        value: '0',
      },
      createdAt: config.createdAt,
    };

    for (const result of data?.results ?? []) {
      if (result.extra?.metadata?.category === ScanResultCategory.Security) {
        qa_CodeQuality.vulnerabilities.value = addNtoString(
          qa_CodeQuality.vulnerabilities.value,
          1,
        );
      }
    }

    let repoInfo;
    if (config.repoInfo) {
      repoInfo = {
        name: config.repoInfo.name,
        organization: qb.ref({
          vcs_Organization: {
            uid: config.repoInfo.organization,
            source: config.repoInfo.source,
          },
        }),
      };
      qa_CodeQuality.repository = qb.ref({
        vcs_Repository: repoInfo,
      });
    }

    if (config.pullRequest && repoInfo) {
      qa_CodeQuality.pullRequest = qb.ref({
        vcs_PullRequest: {
          number: config.pullRequest,
          repository: qb.ref({
            vcs_Repository: repoInfo,
          }),
        },
      });
    }

    if (config.appInfo) {
      qa_CodeQuality.application = qb.ref({
        compute_Application: {
          name: config.appInfo.name,
          platform: config.appInfo.platform,
        },
      });
    }

    mutations.push(qb.upsert({ qa_CodeQuality }));

    return mutations;
  }
}

function addNtoString(numStr: string, n: number): string {
  return (Number(numStr) + n).toString();
}
