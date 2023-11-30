import { Logger } from "pino";
import { VError } from "verror";
import pLimit from "p-limit";
import { FarosClient, Mutation, QueryBuilder } from "faros-js-client";
import fs from "fs";
import { SemgrepConverter } from "./converters";

const MUTATION_BATCH_SIZE = 1000;

export enum ScanTool {
  Semgrep = "semgrep",
}

export type ScanResultsReporterConfig = {
  readonly apiKey: string;
  readonly url: string;
  readonly graph: string;
  readonly origin: string;
  readonly tool: ScanTool;
  readonly commit: string;
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
    const files = paths.flatMap((p) => p.split(",").map((v) => v.trim()));
    this.log.debug("Processing %d paths: %s", files.length, files.join(","));

    const workerPromises = [];
    const limit = pLimit(Number(this.config.concurrency));

    for (const file of files) {
      this.log.debug("Processing scan results in file: %s", file);
      const result = JSON.parse(fs.readFileSync(`${file}`, "utf8"));

      for (const batch of this.getMutationBatches(result, this.config.tool)) {
        if (this.config.dryRun !== true) {
          workerPromises.push(
            limit(async () => {
              try {
                this.faros.sendMutations(this.config.graph, batch);
                this.log.debug("Delivered scan results batch");
              } catch (err: any) {
                const response = err.response?.data
                  ? ` Response: ${JSON.stringify(err.response.data)}`
                  : "";
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

    this.log.info("Processed %d scan results", files.length);
    this.log.info("Done.");
  }

  private *getMutationBatches(
    data: any,
    tool: ScanTool
  ): Generator<Array<Mutation>> {
    let mutations = [];
    switch (tool) {
      case ScanTool.Semgrep:
        mutations = new SemgrepConverter().convert(data, this.qb);
        break;
      default:
        throw new VError("Unsupported scan tool");
    }
    while (mutations.length) {
      yield mutations.splice(0, MUTATION_BATCH_SIZE);
    }
  }
}
