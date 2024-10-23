# Scan Results Reporter

CLI for parsing &amp; uploading code scan results ([Semgrep](https://github.com/semgrep/semgrep), [CodeClimate](https://docs.codeclimate.com/docs/configuring-test-coverage), [Istanbul](https://istanbul.js.org/docs/advanced/alternative-reporters/#json-summary)) to Faros AI API

## Usage

```sh
$ npm i

# Use --help to view all available configuration options
$ ./bin/faros-scan-result-reporter --help

# Run directly
$ ./bin/faros-scan-result-reporter /path/to/results.* \
  -k $FAROS_API_KEY \
  --tool semgrep \
  --repository '<repository>' \
  --organization '<organization>' \
  --source '<source>'

$ ./bin/faros-scan-result-reporter /path/to/results.* \
  -k $FAROS_API_KEY \
  --tool codeclimate \
  --repository '<repository>' \
  --organization '<organization>' \
  --source '<source>' \
  --pull-request 123 \
  --commit '<sha>' \
  --branch '<branch>'
```
Or with Docker: 
```
# Run with docker (make sure to set /path/to/results)

# Example 1: Input file names are known

$ docker run -v "/path/to/results:/results" \
  farosai/faros-scan-results-reporter:latest \
  /results/example1.json /results/example2.json \
  -k $FAROS_API_KEY \
  --tool semgrep \
  --repository '<repository>' \
  --organization '<organization>' \
  --source '<source>'

# Example 2: You want to use a wildcard to match multiple files

# Since wildcard expansion will not work as part of the `docker run` command, you can
# perform the expansion on the host:

$ docker run -v "/path/to/results:/results" \
  farosai/faros-scan-results-reporter:latest \
  $(for file in /path/to/results/*; do echo -n "/results/$(basename "$file") "; done) \
  -k $FAROS_API_KEY \
  --tool semgrep \
  --repository '<repository>' \
  --organization '<organization>' \
  --source '<source>'
```
