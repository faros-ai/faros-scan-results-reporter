import { Mutation, QueryBuilder } from 'faros-js-client';

import { Converter } from '../converter';
import { Config, createCodeCoveragePercentMutations } from './common';

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
    qb: QueryBuilder,
  ): Array<Mutation> {
    if (!data?.git?.head || !data?.covered_percent) {
      return [];
    }
    const coverageValue = data.covered_percent;
    const commitSha = data.git.head;
    const branch = config.branch;
    const createdAt = data?.git?.committed_at
      ? new Date(data.git.committed_at * 1000).toISOString()
      : config.createdAt;

    return createCodeCoveragePercentMutations({
      coverageValue,
      commitSha,
      createdAt,
      config,
      qb,
    });
  }
}
