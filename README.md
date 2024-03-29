# Scan Results Reporter

CLI for parsing &amp; uploading code scan results ([semgrep](https://github.com/semgrep/semgrep) etc.) to Faros AI API

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
  --pull-request 123
```
Or with Docker: 
```
# Run with docker (make sure to set ./path/to/results)
$ docker run -v "./path/to/results:/app/results" farosai/faros-scan-results-reporter:latest ./results/* \
  -k $FAROS_API_KEY \
  --tool semgrep \
  --repository '<repository>' \
  --organization '<organization>' \
  --source '<source>'
```
