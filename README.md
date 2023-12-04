# Scan Results Reporter

CLI for parsing &amp; uploading code scan results ([semgrep](https://github.com/semgrep/semgrep) etc.) to Faros AI API

## Usage

```sh
$ npm i

$ ./bin/faros-scan-result-reporter --help

$ ./bin/faros-scan-result-reporter /path/to/results.* \
  --tool semgrep \
  --repository '<repository>' \
  --organization '<organization>' \
  --source '<source>' \
  --api-key $FAROS_API_KEY
```
