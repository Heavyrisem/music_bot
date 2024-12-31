# Add lockfile and package.json's of isolated subworkspace
FROM node:20 AS installer
ARG NPM_TOKEN
RUN apt-get update && apt-get install -y build-essential python3 python3-pip

WORKDIR /app
RUN corepack enable
COPY ./.npmrc.build ./.npmrc
COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM node:20 AS sourcer
WORKDIR /app

COPY --from=installer /app/ .
COPY ./dist ./dist

FROM node:20 as runner
WORKDIR /app
RUN corepack enable
COPY --from=sourcer /app/ .

WORKDIR /app/apps/server
CMD ["pnpm", "start"]
