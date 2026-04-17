FROM node:22-slim AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN DATABASE_URL=/tmp/build.db \
    BETTER_AUTH_SECRET=build-time-dummy-secret-not-used-at-runtime \
    ORIGIN=http://localhost \
    yarn build
RUN yarn install --production --frozen-lockfile

FROM node:22-slim
WORKDIR /app
RUN mkdir -p /data && chown node:node /data
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./
USER node
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build"]
