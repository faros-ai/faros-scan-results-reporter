# Scan Results Reporter

CLI for parsing &amp; uploading code scan results ([semgrep](https://github.com/semgrep/semgrep) etc.) to Faros AI API

## Usage

```sh
$ npm i

$ ./bin/faros-scan-result-reporter /path/to/results.* \
  --tool semgrep \
  --commit GitHub://acme-corp/my-repo/da500aa4f54cbf8f3eb47a1dc2c136715c9197b9 \
  --graph default \
  --api-key $FAROS_API_KEY
```
