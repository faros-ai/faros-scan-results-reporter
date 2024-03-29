import { Mutation, QueryBuilder, Utils } from 'faros-js-client';
import { v4 } from 'uuid';

import { Converter } from '../converter';
import { CodeQualityCategory, CodeQualityMetricType } from '../types';
import { Config } from './common';

export interface CodeCoverageReport {
  git: {
    head: string;
    committed_at: number;
  };
  covered_percent: number;
}

export class CodeClimateConverter extends Converter {
  convert(
    data: CodeCoverageReport,
    config: Config,
    qb: QueryBuilder
  ): Array<Mutation> {
    if (!data?.git?.head || !data?.covered_percent) {
      return [];
    }

    const mutations = [];

    const qa_CodeQuality: any = {
      uid: v4(),
      coverage: {
        category: CodeQualityCategory.Coverage,
        type: CodeQualityMetricType.Percent,
        name: 'Coverage',
        value: data.covered_percent,
      },
      createdAt: data?.git?.committed_at
        ? new Date(data.git.committed_at * 1000).toISOString()
        : config.createdAt,
    };

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
      qa_CodeQuality.commit = qb.ref({
        vcs_Commit: {
          sha: data.git.head,
          repository: qb.ref({
            vcs_Repository: repoInfo,
          }),
        },
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
