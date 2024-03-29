import { Command, Option } from 'commander';
import { Utils } from 'faros-js-client';
import { DateTime } from 'luxon';
import path from 'path';
import pino from 'pino';

import {
  ScanResultsReporter,
  ScanResultsReporterConfig,
  ScanTool,
} from './scan-results-reporter';

export const DEFAULT_GRAPH_NAME = 'default';
export const DEFAULT_ORIGIN = 'faros-scan-results-reporter';
export const DEFAULT_API_URL = 'https://prod.api.faros.ai';
const DEFAULT_CONCURRENCY = '8';

/** The main entry point. */
export function mainCommand(): Command {
  const cmd = new Command();

  const version = require(path.join(__dirname, '..', 'package.json')).version;

  cmd
    .name('faros-test-results-reporter')
    .description(
      'CLI for parsing & uploading scan results (Semgrep, etc.) to Faros AI API'
    )
    .version(version)
    .argument(
      '<paths...>',
      'space or comma separated path(s) to test results file(s) (globs are supported)'
    );

  const format = new Option(
    '--tool <tool>',
    'scan tool used to produce the results'
  )
    .choices(Object.values(ScanTool))
    .makeOptionMandatory(true);
  cmd.addOption(format);

  cmd.requiredOption(
    '-k, --api-key <key>',
    'Your Faros API key. See the documentation for more information on obtaining an API key'
  );
  cmd.option(
    '-u, --url <url>',
    'The Faros API url to send the test results to',
    DEFAULT_API_URL
  );
  cmd.option(
    '-g, --graph <name>',
    'The graph to which the test results should be sent',
    DEFAULT_GRAPH_NAME
  );
  cmd.option(
    '--origin <name>',
    'The origin of the data that is being sent to Faros',
    DEFAULT_ORIGIN
  );
  cmd.option(
    '--repository <repository>',
    'The name of the VCS repository that was scanned'
  );
  cmd.option(
    '--organization <organization>',
    'The name of the VCS organization that contains the repository'
  );
  cmd.option('--source <source>', 'The name of your VCS source');
  cmd.option(
    '--pull-request <vcs-pull-request>',
    'The VCS pull request number',
    Utils.parseIntegerPositive
  );
  cmd.option(
    '--application <application>',
    'The name of the application that the code represents'
  );
  cmd.option(
    '--application-platform <application-platform>',
    'The application platform'
  );
  cmd.option(
    '--scanned-at <scanned-at>',
    'The timestamp of when the scan was performed. Defaults to NOW',
    DateTime.now().toISO()
  );
  cmd.option('--debug', 'Enable debug logging', false);
  cmd.option('--dry-run', 'Print the data instead of sending it', false);
  cmd.option(
    '--concurrency <number>',
    'Number of concurrent requests to Faros API',
    DEFAULT_CONCURRENCY
  );

  cmd.action(async (paths, options) => {
    const log = pino({
      level: process.env.LOG_LEVEL ?? (options.debug ? 'debug' : 'info'),
      transport: { target: 'pino-pretty' },
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
