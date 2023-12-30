# Add lockfile and package.json's of isolated subworkspace
FROM node:18-alpine AS installer
ARG NPM_TOKEN
RUN apk add --update alpine-sdk
RUN apk add --no-cache python3 py3-pip

WORKDIR /app
RUN corepack enable
COPY ./.npmrc.build ./.npmrc
COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM node:18-alpine AS sourcer
WORKDIR /app


COPY --from=installer /app/ .
COPY ./dist ./dist

FROM node:18-alpine as runner
WORKDIR /app
RUN corepack enable
COPY --from=sourcer /app/ .

WORKDIR /app/apps/server
CMD ["pnpm", "start"]