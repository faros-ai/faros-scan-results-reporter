import { Mutation, QueryBuilder } from 'faros-js-client';

import { Converter } from '../converter';
import { Config, createCodeCoveragePercentMutations } from './common';

export interface IstanbulCoverageReport {
  total: {
    lines: {
      pct: number;
    };
  };
}

export class IstanbulConverter extends Converter {
  convert(
    data: IstanbulCoverageReport,
    config: Config,
    qb: QueryBuilder,
  ): Array<Mutation> {
    if (!data?.total?.lines?.pct) {
      return [];
    }
    const coverageValue = data.total.lines.pct;
    const commitSha = config.commit;
    const createdAt = config.createdAt;

    return createCodeCoveragePercentMutations({
      coverageValue,
      commitSha,
      createdAt,
      config,
      qb,
    });
  }
}
