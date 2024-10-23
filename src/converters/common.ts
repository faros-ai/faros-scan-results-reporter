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
  readonly commit?: string;
  readonly branch?: string;
}

interface CodeCoverageMutationParams {
  coverageValue: number;
  commitSha?: string;
  createdAt: string;
  config: Config;
  qb: QueryBuilder;
}

export function createCodeCoveragePercentMutations(
  params: CodeCoverageMutationParams
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

  let repoRef;
  let commitRef;
  if (config.repoInfo) {
    repoRef = qb.ref({
      vcs_Repository: {
        name: config.repoInfo.name,
        organization: qb.ref({
          vcs_Organization: {
            uid: config.repoInfo.organization,
            source: config.repoInfo.source,
          },
        }),
      },
    });
    qa_CodeQuality.repository = repoRef;
    if (commitSha) {
      commitRef = qb.ref({
        vcs_Commit: {
          sha: commitSha,
          repository: repoRef,
        },
      });
      qa_CodeQuality.commit = commitRef;
    }
  }

  if (config.pullRequest && repoRef) {
    qa_CodeQuality.pullRequest = qb.ref({
      vcs_PullRequest: {
        number: config.pullRequest,
        repository: repoRef,
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
  if (config.branch && commitRef && repoRef) {
    const branch = {
      name: config.branch,
      repository: repoRef,
    };

    const branchCommitAssociation = {
      commit: commitRef,
      branch: qb.ref({
        vcs_Branch: branch,
      }),
    };

    mutations.push(qb.upsert({ vcs_Branch: branch }));
    mutations.push(qb.upsert({ vcs_BranchCommitAssociation: branchCommitAssociation }));
  }

  return mutations;
}
