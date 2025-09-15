FROM node:22-alpine as build

WORKDIR /app

COPY . .

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

RUN pnpm run build

RUN docker-compose up -d

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY --from=build /app/package.json ./package.json

COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN npm install -g pnpm

RUN pnpm install --prod

CMD ["pnpm", "run", "start:prod"]
