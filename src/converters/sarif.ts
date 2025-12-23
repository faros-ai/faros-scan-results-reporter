import { Mutation, QueryBuilder } from 'faros-js-client';
import { v4 } from 'uuid';

import { Converter } from '../converter';
import { CodeQualityCategory, CodeQualityMetricType } from '../types';
import { Config } from './common';

interface SarifMessage {
  readonly text: string;
}

interface SarifArtifactLocation {
  readonly uri: string;
}

interface SarifPhysicalLocation {
  readonly artifactLocation: SarifArtifactLocation;
}

interface SarifLocation {
  readonly physicalLocation: SarifPhysicalLocation;
}

interface SarifResult {
  readonly ruleId: string;
  readonly ruleIndex: number;
  readonly kind: string;
  readonly level: string;
  readonly message: SarifMessage;
  readonly locations: Array<SarifLocation>;
}

interface SarifRuleProperties {
  readonly cvssV3_severity?: string;
  readonly 'security-severity'?: string;
  readonly tags?: Array<string>;
}

interface SarifRule {
  readonly id: string;
  readonly name: string;
  readonly shortDescription?: SarifMessage;
  readonly properties?: SarifRuleProperties;
}

interface SarifDriver {
  readonly name: string;
  readonly fullName?: string;
  readonly rules: Array<SarifRule>;
}

interface SarifTool {
  readonly driver: SarifDriver;
}

interface SarifRun {
  readonly tool: SarifTool;
  readonly results: Array<SarifResult>;
}

export interface SarifOutput {
  readonly version: string;
  readonly $schema?: string;
  readonly runs: Array<SarifRun>;
}

export class SarifConverter extends Converter {
  convert(data: SarifOutput, config: Config, qb: QueryBuilder): Array<Mutation> {
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

    // Count all results across all runs as vulnerabilities
    for (const run of data?.runs ?? []) {
      for (const result of run?.results ?? []) {
        // Each result in SARIF represents a finding/vulnerability
        if (result.kind === 'fail' || result.level === 'error' || result.level === 'warning' || result.level === 'note') {
          qa_CodeQuality.vulnerabilities.value = addNtoString(
            qa_CodeQuality.vulnerabilities.value,
            1,
          );
        }
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

