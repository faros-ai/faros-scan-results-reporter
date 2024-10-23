import { Mutation, QueryBuilder } from 'faros-js-client';
import { v4 } from 'uuid';

import { CodeQualityCategory, CodeQualityMetricType } from '../types';

export interface Config {
  readonly repoInfo?: {
    readonly name: string;
    readonly organization: string;
    readonly source: string;
  };
  readonly pullRequest?: number;
  readonly appInfo?: {
    readonly name: string;
    readonly platform: string;
  };
  readonly createdAt: string;
}

interface CodeCoverageMutationParams {
  coverageValue: number;
  commitSha: string;
  createdAt: string;
  config: Config;
  qb: QueryBuilder;
}

export function createCodeCoveragePercentMutations(
  params: CodeCoverageMutationParams,
): Array<Mutation> {
  const { coverageValue, commitSha, createdAt, config, qb } = params;
  const mutations = [];

  const qa_CodeQuality: any = {
    uid: v4(),
    coverage: {
      category: CodeQualityCategory.Coverage,
      type: CodeQualityMetricType.Percent,
      name: 'Coverage',
      value: coverageValue,
    },
    createdAt,
  };

  let repo;
  if (config.repoInfo) {
    repo = {
      name: config.repoInfo.name,
      organization: qb.ref({
        vcs_Organization: {
          uid: config.repoInfo.organization,
          source: config.repoInfo.source,
        },
      }),
    };
    qa_CodeQuality.repository = qb.ref({
      vcs_Repository: repo,
    });
    qa_CodeQuality.commit = qb.ref({
      vcs_Commit: {
        sha: commitSha,
        repository: qb.ref({
          vcs_Repository: repo,
        }),
      },
    });
  }

  if (config.pullRequest && repo) {
    qa_CodeQuality.pullRequest = qb.ref({
      vcs_PullRequest: {
        number: config.pullRequest,
        repository: qb.ref({
          vcs_Repository: repo,
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
