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

# Run with docker (make sure to set ./path/to/results)
$ docker run -v "./path/to/results:/app/results" scanner:test ./results/* \
  -k $FAROS_API_KEY \
  --tool semgrep \
  --repository '<repository>' \
  --organization '<organization>' \
  --source '<source>'
```
