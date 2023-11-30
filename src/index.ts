import { Command, Option } from "commander";
import path from "path";

import pino from "pino";
import {
  ScanResultsReporter,
  ScanResultsReporterConfig,
  ScanTool,
} from "./scan-results-reporter";

export const DEFAULT_GRAPH_NAME = "default";
export const DEFAULT_ORIGIN = "faros-scan-results-reporter";
export const DEFAULT_API_URL = "https://prod.api.faros.ai";

/** The main entry point. */
export function mainCommand(): Command {
  const cmd = new Command();

  const version = require(path.join(__dirname, "..", "package.json")).version;

  cmd
    .name("faros-test-results-reporter")
    .description(
      "CLI for parsing & uploading scan results (Semgrep, etc.) to Faros AI API"
    )
    .version(version)
    .argument(
      "<paths...>",
      "space or comma separated path(s) to test results file(s) (globs are supported)"
    );

  const format = new Option(
    "--tool <tool>",
    "scan tool used to produce the results"
  )
    .choices(Object.values(ScanTool))
    .makeOptionMandatory(true);
  cmd.addOption(format);

  const key = new Option(
    "-k, --api-key <key>",
    "Your Faros API key. See the documentation for more information on obtaining an API key"
  ).makeOptionMandatory(true);
  cmd.addOption(key);

  const url = new Option(
    "-u, --url <url>",
    "The Faros API url to send the test results to"
  ).default(DEFAULT_API_URL);
  cmd.addOption(url);

  const graph = new Option(
    "-g, --graph <name>",
    "The graph to which the test results should be sent"
  ).default(DEFAULT_GRAPH_NAME);
  cmd.addOption(graph);

  const origin = new Option(
    "--origin <name>",
    "The origin of the data that is being sent to Faros"
  ).default(DEFAULT_ORIGIN);
  cmd.addOption(origin);

  const commit = new Option(
    "--commit <uri>",
    'The URI of the commit of the form: <source>://<organization>/<repository>/<commit_sha> (e.g. "GitHub://faros-ai/my-repo/da500aa4f54cbf8f3eb47a1dc2c136715c9197b9")'
  ).makeOptionMandatory(true);
  cmd.addOption(commit);

  const debug = new Option("--debug", "Enable debug logging").default(false);
  cmd.addOption(debug);

  const dryRun = new Option(
    "--dry-run",
    "Print the data instead of sending it"
  ).default(false);
  cmd.addOption(dryRun);

  const concurrency = new Option(
    "--concurrency <number>",
    "Number of concurrent requests to Faros API"
  ).default(8);
  cmd.addOption(concurrency);

  cmd.action(async (paths, options) => {
    const log = pino({
      level: process.env.LOG_LEVEL ?? (options.debug ? "debug" : "info"),
      transport: { target: "pino-pretty" },
    });
    const config: ScanResultsReporterConfig = { ...options };

    try {
      await new ScanResultsReporter(config, log).process(paths);
    } catch (err: any) {
      log.error({ err }, `Processing failed. Error: ${err.message}`);
      process.exit(1);
    }
  });

  return cmd;
}
