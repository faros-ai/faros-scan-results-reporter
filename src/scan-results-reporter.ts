import { FarosClient, Mutation, QueryBuilder } from 'faros-js-client';
import fs from 'fs';
import pLimit from 'p-limit';
import { Logger } from 'pino';
import { VError } from 'verror';

import { SemgrepConverter } from './converters';
import { CodeClimateConverter } from './converters/codeclimate';
import { Config } from './converters/common';

const MUTATION_BATCH_SIZE = 1000;

export enum ScanTool {
  CodeClimate = 'codeclimate',
  Semgrep = 'semgrep',
}

export type ScanResultsReporterConfig = {
  readonly apiKey: string;
  readonly url: string;
  readonly graph: string;
  readonly origin: string;
  readonly tool: ScanTool;
  readonly scannedAt: string;
  readonly vcsPullRequest?: number;
  readonly vcsRepository?: string;
  readonly vcsOrganization?: string;
  readonly vcsSource?: string;
  readonly computeApplication?: string;
  readonly computeApplicationPlatform?: string;
  readonly debug: boolean;
  readonly dryRun: boolean;
  readonly concurrency: number;
};

export class ScanResultsReporter {
  private readonly config: ScanResultsReporterConfig;
  private readonly log: Logger;
  private readonly faros: FarosClient;
  private readonly qb: QueryBuilder;

  constructor(config: ScanResultsReporterConfig, log: Logger) {
    this.config = config;
    this.log = log;
    this.faros = new FarosClient({
      apiKey: this.config.apiKey,
      url: this.config.url,
      useGraphQLV2: true,
    });
    this.qb = new QueryBuilder(this.config.origin);
  }

  async process(paths: ReadonlyArray<string>): Promise<void> {
    const files = paths.flatMap((p) => p.split(',').map((v) => v.trim()));
    this.log.debug('Processing %d paths: %s', files.length, files.join(','));

    const workerPromises = [];
    const limit = pLimit(Number(this.config.concurrency));

    for (const file of files) {
      this.log.debug('Processing scan results in file: %s', file);
      const result = JSON.parse(fs.readFileSync(`${file}`, 'utf8'));

      for (const batch of this.getMutationBatches(result, this.config)) {
        if (this.config.dryRun !== true) {
          workerPromises.push(
            limit(async () => {
              try {
                this.faros.sendMutations(this.config.graph, batch);
                this.log.debug('Delivered scan results batch');
              } catch (err: any) {
                const response = err.response?.data
                  ? ` Response: ${JSON.stringify(err.response.data)}`
                  : '';
                const msg = `Failed to report scan results batch. Error: ${err.message}.${response}`;
                throw new VError(msg);
              }
            })
          );
        }
      }
    }

    // Wait for all the requests to complete
    await Promise.all(workerPromises);

    this.log.info('Processed %d scan results', files.length);
    this.log.info('Done.');
  }

  private *getMutationBatches(
    data: any,
    config: any
  ): Generator<Array<Mutation>> {
    let mutations = [];

    let repoInfo: {
      name: string;
      organization: string;
      source: string;
    };
    if (config.repository && config.organization && config.source) {
      repoInfo = {
        name: config.repository,
        organization: config.organization,
        source: config.source,
      };
    }
    let appInfo: {
      name: string;
      platform: string;
    };
    if (config.application) {
      appInfo = {
        name: config.application,
        platform: config.applicationPlatform ?? '',
      };
    }

    const converterConf: Config = {
      repoInfo,
      pullRequest: config.pullRequest,
      appInfo,
      createdAt: config.scannedAt,
    };

    switch (config.tool) {
      case ScanTool.CodeClimate:
        mutations = new CodeClimateConverter().convert(
          data,
          converterConf,
          this.qb
        );
        break;
      case ScanTool.Semgrep:
        mutations = new SemgrepConverter().convert(
          data,
          converterConf,
          this.qb
        );
        break;
      default:
        throw new VError('Unsupported scan tool');
    }

    while (mutations.length) {
      yield mutations.splice(0, MUTATION_BATCH_SIZE);
    }
  }
}
