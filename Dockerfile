FROM node:18-bullseye-slim as base

###################################################
# Builder image
###################################################
FROM base AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y bash
COPY . .
RUN npm i

# Remove write permission from executables -- SonarCloud rule docker:S6504
RUN find . -type f -executable -exec chmod -w {} \;

###################################################
# Runner image
###################################################
FROM base AS runner
WORKDIR /app

#Add tini - available at /sbin/tini
RUN apt-get update && apt-get install -y tini bash wget

# Copy compiled project from builder
USER node
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/bin ./bin
COPY --chown=node:node --from=builder /app/lib ./lib
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# We use tini so that node process does not run as PID 1
# as doing so causes it to ignore certains signals like SIGINT.

ENTRYPOINT ["tini", "--", "./bin/faros-scan-result-reporter"]
