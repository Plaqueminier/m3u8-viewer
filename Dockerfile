# Use an official Node runtime as the base image
FROM node:22-alpine

RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY ./src ./src
COPY ./.next ./.next
COPY ./next.config.mjs .
COPY ./.env .
COPY ./tailwind.config.ts .
COPY ./postcss.config.mjs .
COPY ./tsconfig.json .

RUN npm install -g pnpm
RUN pnpm install
RUN cd node_modules/better-sqlite3 && pnpm build-release
RUN pnpm approve-builds
RUN pnpm run build

EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]