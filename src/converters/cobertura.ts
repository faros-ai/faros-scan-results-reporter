import { Mutation, QueryBuilder } from 'faros-js-client';

import { Converter } from '../converter';
import { CodeQualityCategory, CodeQualityMetricType } from '../types';
import { Config, createCodeCoveragePercentMutations } from './common';

export interface CoberturaReport {
  coverage: {
    $: {
      'line-rate': string;
      'lines-covered'?: string;
      'lines-valid'?: string;
      timestamp?: string;
    };
  };
}

export class CoberturaConverter extends Converter {
  convert(
    data: CoberturaReport,
    config: Config,
    qb: QueryBuilder,
  ): Array<Mutation> {
    const attrs = data?.coverage?.$;
    const lineRate = parseFloat(attrs?.['line-rate']);
    if (isNaN(lineRate)) {
      return [];
    }
    const coverageValue = lineRate * 100;
    const commitSha = config.commit;

    // Cobertura timestamps are Unix epoch seconds; convert to milliseconds for Date
    const timestamp = attrs?.timestamp;
    const createdAt = timestamp
      ? new Date(parseInt(timestamp, 10) * 1000).toISOString()
      : config.createdAt;

    const mutations = createCodeCoveragePercentMutations({
      coverageValue,
      commitSha,
      createdAt,
      config,
      qb,
    });

    // Enrich the qa_CodeQuality mutation with additional Cobertura metrics
    if (mutations.length > 0) {
      const codeQualityMutation = mutations[0] as any;
      const obj =
        codeQualityMutation.mutation.insert_qa_CodeQuality_one.__args.object;

      const linesValid = parseInt(attrs?.['lines-valid'], 10);
      const linesCovered = parseInt(attrs?.['lines-covered'], 10);

      obj.lineCoverage = {
        category: CodeQualityCategory.Coverage,
        type: CodeQualityMetricType.Percent,
        name: 'Line Coverage',
        value: coverageValue,
      };

      if (!isNaN(linesValid)) {
        obj.linesToCover = {
          category: CodeQualityCategory.Coverage,
          type: CodeQualityMetricType.Int,
          name: 'Lines to Cover',
          value: linesValid,
        };

        if (!isNaN(linesCovered)) {
          obj.uncoveredLines = {
            category: CodeQualityCategory.Coverage,
            type: CodeQualityMetricType.Int,
            name: 'Uncovered Lines',
            value: linesValid - linesCovered,
          };
        }
      }
    }

    return mutations;
  }
}
